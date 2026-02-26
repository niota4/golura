const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');
const cloudinary = require('../config/cloudinary');
const { Client, Image, Document, Video, Company, Template, User, Item, Vendor, VendorItem, ClientEmail, ClientPhoneNumber, ClientAddress, UserDocument, UserFolder } = require('../models');
const ffmpeg = require('fluent-ffmpeg');
const pdfLib = require('pdf-lib');
const sharp = require('sharp');
const { Op } = require('sequelize');
const { url } = require('inspector');
const mammoth = require('mammoth');
const { re } = require('mathjs');

const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

const getChunkFilename = (identifier, chunkNumber) => {
  if (!identifier || isNaN(chunkNumber)) {
    throw new Error('Invalid arguments passed to getChunkFilename');
  }
  return `fineuploader-${identifier}.${chunkNumber}`;
};

const verifyChunks = (identifier, totalChunks, callback) => {
  let isComplete = true;
  for (let i = 0; i < totalChunks; i++) {
    const chunkFilename = getChunkFilename(identifier, i);
    const chunkPath = path.join(__dirname, '../uploads', chunkFilename);
    if (!fs.existsSync(chunkPath)) {
      isComplete = false;
      break;
    }
  }
  callback(isComplete);
};

const assembleChunks = (identifier, filename, totalChunks, callback) => {
  if (!identifier || !filename || isNaN(totalChunks)) {
    throw new Error('Invalid arguments passed to assembleChunks');
  }
  const filePath = path.join(__dirname, '../uploads', filename);
  const writeStream = fs.createWriteStream(filePath);
  let currentChunk = 0;

  const appendChunk = () => {
    const chunkFilename = getChunkFilename(identifier, currentChunk);
    const chunkPath = path.join(__dirname, '../uploads', chunkFilename);
    fs.createReadStream(chunkPath)
      .on('end', () => {
        currentChunk++;
        if (currentChunk >= totalChunks) {
          callback(null, filePath);
        } else {
          appendChunk();
        }
      })
      .on('error', callback)
      .pipe(writeStream, { end: false });
  };

  appendChunk();
};

const compressVideo = async (filePath, compressedFilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .output(compressedFilePath)
      .size('50%')
      .on('start', (commandLine) => {
        console.log('Spawned ffmpeg with command: ' + commandLine);
      })
      .on('progress', (progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .on('end', () => {
        console.log('Compression finished successfully');
        resolve();
      })
      .on('error', (err, stdout, stderr) => {
        console.error('Error occurred: ' + err.message);
        console.error('ffmpeg output: ' + stdout);
        console.error('ffmpeg stderr: ' + stderr);
        reject(new Error(`ffmpeg exited with code ${err.code}: ${err.message}`));
      })
      .run();
  });
};

const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto'
    });
    fs.unlinkSync(filePath); // Remove temporary file
    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    throw new Error(err.message || 'Error uploading to Cloudinary');
  }
};
const uploadPayrollPdfToCloudinary = async (filePath, payrollId, employeeId) => {
  try {
    const folderPath = `payroll/${payrollId}`;
    let filename = `payroll-${employeeId}`;
    let counter = 0;
    let finalFilename = filename;
    
    // Check if file already exists and generate unique filename
    while (true) {
      try {
        // Try to get existing resource
        await cloudinary.api.resource(`${folderPath}/${finalFilename}`, { resource_type: 'raw' });
        // If we reach here, file exists, so increment counter
        counter++;
        finalFilename = `${filename}-${counter}`;
      } catch (error) {
        // If error is 'Not Found', then the filename is available
        if (error.http_code === 404) {
          break;
        }
        // If it's a different error, break and use the filename
        break;
      }
    }
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderPath,
      public_id: finalFilename,
      resource_type: 'auto',
      format: 'pdf'
    });
    
    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return { 
      url: result.secure_url, 
      publicId: result.public_id 
    };
  } catch (err) {
    // Clean up temporary file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(err.message || 'Error uploading PDF to Cloudinary');
  }
};

const uploadEstimatePdfToCloudinary = async (filePath, estimateId) => {
  try {
    const folderPath = `estimates/${estimateId}`;
    let filename = `estimate-${estimateId}`;
    let counter = 0;
    let finalFilename = filename;
    
    // Check if file already exists and generate unique filename
    while (true) {
      try {
        // Try to get existing resource
        await cloudinary.api.resource(`${folderPath}/${finalFilename}`, { resource_type: 'raw' });
        // If we reach here, file exists, so increment counter
        counter++;
        finalFilename = `${filename}-${counter}`;
      } catch (error) {
        // If error is 'Not Found', then the filename is available
        if (error.http_code === 404) {
          break;
        }
        // If it's a different error, break and use the filename
        break;
      }
    }
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderPath,
      public_id: finalFilename,
      resource_type: 'auto',
      format: 'pdf'
    });
    
    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return { 
      url: result.secure_url, 
      publicId: result.public_id 
    };
  } catch (err) {
    // Clean up temporary file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(err.message || 'Error uploading estimate PDF to Cloudinary');
  }
};

const handleFileSaving = async (
  filePath,
  filename,
  type,
  clientId,
  finalEventId,
  finalEstimateId,
  finalMarketingId,
  finalTemplateId,
  finalCommentId,
  finalMessageId,
  userId,
  folderId,
  finalChatRoomId,
  title,
  companyId
) => {
  // Define the folder path based on type
  let folderPath;
  let media; // Used for returning the saved media instance
  if (type === 'companyLogo') {
    folderPath = `company/logo`;
  } else if (type === 'email') {
    folderPath = `templates/emails`;
  } else if (type === 'pdf') {
    folderPath = `templates/pdfs`;
  } else if (type === 'user') {
    folderPath = `users/${userId}/profile-picture`;
  } else if (type === 'userDrive') {
    folderPath = `users/${userId}/drive`;
  } else if (type === 'messages') { 
    folderPath = `chat-rooms/${finalChatRoomId}/${finalMessageId}`;
  } else if (type === 'textMessages') {
    folderPath = clientId ? `clients/${clientId}/text-messages` : `text-messages`;
  } else if (clientId) {
    if (finalEventId) {
      folderPath = `clients/${clientId}/events/${type}/${finalEventId}`;
    } else if (finalMarketingId) {
      folderPath = `clients/${clientId}/marketing/${type}/${finalMarketingId}`;
    } else {
      folderPath = `clients/${clientId}/unassigned/${type}`;
    }
  } else {
    if (finalEventId) {
      folderPath = `events/${type}/${finalEventId}`;
    } else if (finalMarketingId) {
      folderPath = `marketing/${type}/${finalMarketingId}`;
    } else {
      folderPath = `unassigned/${type}`;
    }
  }

  // Compress video files if necessary
  const compressedFilePath = path.join(__dirname, '../uploads', `compressed-${filename}`);
  if (filename.endsWith('.mp4')) {
    await compressVideo(filePath, compressedFilePath);
    filePath = compressedFilePath;
  }

  // Extract metadata
  const metadata = {
    clientId,
    title: title || filename,
    eventId: finalEventId,
    marketingId: finalMarketingId,
    estimateId: finalEstimateId,
    userId,
    size: fs.statSync(filePath).size,
    format: path.extname(filename).replace('.', '').toLowerCase(),
  };

  try {
    if (type === 'images' || (type === 'userDrive' && metadata.format.match(/(jpg|jpeg|png|gif|bmp|tiff)/))) {
      // Extract image metadata
      const imageMeta = await sharp(filePath).metadata();
      metadata.width = imageMeta.width;
      metadata.height = imageMeta.height;
      metadata.format = imageMeta.format;
    } else if (filename.endsWith('.mp4')) {
      // Extract video metadata
      await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, videoMeta) => {
          if (err) return reject(err);
          const stream = videoMeta.streams.find(s => s.codec_type === 'video');
          metadata.duration = videoMeta.format.duration;
          metadata.resolution = `${stream.width}x${stream.height}`;
          metadata.frameRate = eval(stream.avg_frame_rate); // Convert frame rate to number
          resolve();
        });
      });
    } else if (type === 'documents' || type === 'userDrive') {
      if (metadata.format === 'pdf') {
        // Extract PDF metadata with ignoreEncryption option
        const fileBuffer = fs.readFileSync(filePath);
        const pdfDoc = await pdfLib.PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        metadata.pageCount = pdfDoc.getPageCount();
        metadata.author = pdfDoc.getAuthor() || 'Unknown';
      } else if (metadata.format === 'docx') {
        // Extract Word document metadata
        const fileBuffer = fs.readFileSync(filePath);
        const { value: textContent } = await mammoth.extractRawText({ buffer: fileBuffer });
        metadata.textPreview = textContent.slice(0, 500); // Save first 500 characters
      } else if (metadata.format === 'csv') {
        // Extract CSV metadata
        const fileBuffer = fs.readFileSync(filePath, 'utf8');
        metadata.textPreview = fileBuffer.slice(0, 500); // Save first 500 characters
      }
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadToCloudinary(filePath, folderPath);
    metadata.url = url;
    metadata.publicId = publicId;

    // Save metadata to the appropriate model
    if (type === 'userDrive') {
      const folder = await UserFolder.findOne({ where: { id: folderId, isActive: true } });
      if (!folder) {
        throw new Error('Folder not found');
      }
      metadata.folderId = folderId;
      metadata.userId = userId;
      media = await UserDocument.create(metadata);
    } else if (filename.endsWith('.mp4')) {
      media = await Video.create(metadata);
    } else if (type === 'documents') {
      media = await Document.create(metadata);
    } else if (type === 'companyLogo') {
      const company = await Company.findByPk(companyId);
      if (company) {
        company.logoUrl = url;
        await company.save();
      }
    } else if (type === 'email' || type === 'pdf') {
      const template = await Template.findOne({
        where: { id: finalTemplateId}
      });
      
      if (template) {
        template.url = url;
        media = await template.save();
      }
    } else if (type === 'user') {
      const user = await User.findOne({ where: { id: userId } });
        console.log('Updating user profile picture URL:', url);
      if (user) {
        user.profilePictureUrl = url;
        await user.save();
      } else {
        throw new Error('User not found');
      }
    } else {
      media = await Image.create(metadata);
    }
    return { success: true, msg: `${type} uploaded and reference saved successfully`, media };
  } catch (error) {
    console.error('Error processing file metadata:', error);
    throw error;
  } finally {
    // Optional: Clean up temporary files
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const handleCSVImport = async (filePath, subType) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          let i = 0;
          switch (subType) {
            case 'items' :
              for (const row of results) {
                const { vendorName, partNumber, name, price, reorderPoint, quantity, minimumOrderQuantity, leadTime, force } = row;
  
                // Ensure vendor exists
                let vendor = await Vendor.findOne({ where: { name: vendorName } });
                if (!vendor) {
                  if (force && force.toLowerCase() === 'true') {
                    vendor = await Vendor.create({ name: vendorName });
                  } else {
                    // Find similar vendor names
                    const similarVendors = await Vendor.findAll({
                      where: {
                        name: {
                          [Op.like]: `%${vendorName}%`
                        }
                      }
                    });
                    const similarVendorNames = similarVendors.map(v => v.name);
                    return reject({ success: false, msg: `Vendor with name "${vendorName}" not found. Did you mean one of these?`, similarVendorNames });
                  }
                }
                // Check if item exists
                let item = await Item.findOne({ where: { partNumber } });
                if (!item) {
                  console.log(`Item with part number ${partNumber} not found, creating new item.`);
                  // Create new item
                  item = await Item.create({
                    partNumber,
                    name,
                    isActive: true,
                  });
                }
  
                // Create or update VendorItem
                const vendorItem = await VendorItem.upsert({
                  vendorId: vendor.id,
                  itemId: item.id,
                  price: parseFloat(price),
                  reorderPoint: parseInt(reorderPoint, 10),
                  quantity: parseInt(quantity, 10),
                  minimumOrderQuantity: parseInt(minimumOrderQuantity, 10),
                  leadTime: parseInt(leadTime, 10),
                  isActive: true,
                });
                if (vendorItem) {
                  i++;
                };
              }
            break;
            case 'clients' :
              for (const row of results) {
                const { id, firstName, lastName, email, phoneNumber, address } = row;
                let client;

                if (id) {
                  client = await Client.findByPk(id);
                } else {
                  client = await Client.findOne({ where: { firstName, lastName } });
                  if (!client) {
                    client = await Client.create({ firstName, lastName, isActive: true });
                  }
                }

                if (client) {
                  if (email) {
                    await ClientEmail.create({ clientId: client.id, email, isActive: true });
                  }
                  if (phoneNumber) {
                    await ClientPhoneNumber.create({ clientId: client.id, number: phoneNumber, isActive: true });
                  }
                  if (address) {
                    await ClientAddress.create({ clientId: client.id, street1: address, isActive: true });
                  }
                }
              }
              break;
          }
          resolve({ success: true, msg: 'CSV imported successfully', count: i, media: {
            url: null, // No URL for CSV import
            publicId: null, // No public ID for CSV import
          } });
        } catch (error) {
          reject(error);
        } finally {
          fs.unlinkSync(filePath); // Clean up temporary file
        }
      });
  });
};

const handleFineUploaderUpload = async (req, res) => {
  const identifier = req.body.qquuid;
  const filename = req.body.qqfilename;
  const chunkNumber = req.body.qqpartindex ? parseInt(req.body.qqpartindex, 10) : null;
  const totalChunks = req.body.qqtotalparts ? parseInt(req.body.qqtotalparts, 10) : null;
  if (!identifier || !filename) {
    return res.status(400).send({ success: false, err: 'Invalid upload parameters' });
  }

  if (chunkNumber === null || totalChunks === null) {
    const file = req.file;
    if (!file) {
      return res.status(400).send({ success: false, err: 'No file uploaded.' });
    }

    // Define the variables for the save function
    const type = req.body.type || 'documents';
    const title = req.body.title;
    const clientId = req.body.clientId;
    const eventId = req.body.eventId;
    const estimateId = req.body.estimateId;
    const marketingId = req.body.marketingId;
    const templateId = req.body.templateId;
    const folderId = req.body.folderId;
    const messageId = req.body.messageId;
    const commentId = req.body.commentId;
    const chatRoomId = req.body.chatRoomId; 
    const userId = req.body.userId || req.user.id; // Use logged-in user ID if not provided
    const subType = req.body.subType;
    const finalClientId = clientId && Number.isInteger(Number(clientId)) ? clientId : null;
    const finalEventId = eventId && Number.isInteger(Number(eventId)) ? eventId : null;
    const finalEstimateId = estimateId && Number.isInteger(Number(estimateId)) ? estimateId : null;
    const finalMarketingId = marketingId && Number.isInteger(Number(marketingId)) ? marketingId : null;
    const finalTemplateId = templateId && Number.isInteger(Number(templateId)) ? templateId : null;
    const finalUserId = userId && Number.isInteger(Number(userId)) ? userId : null;
    const finalFolderId = folderId && Number.isInteger(Number(folderId)) ? folderId : null;
    const finalMessageId = messageId && Number.isInteger(Number(messageId)) ? messageId : null;
    const finalCommentId = commentId && Number.isInteger(Number(commentId)) ? commentId : null;
    const finalChatRoomId = chatRoomId && Number.isInteger(Number(chatRoomId)) ? chatRoomId : null;

    try {
      if (type === 'import') {
        // Handle CSV import
        const result = await handleCSVImport(file.path, subType);
        return res.send(result);
      } else {
        // Call the common file saving logic
        const result = await handleFileSaving(
          file.path, 
          filename, 
          type, 
          finalClientId, 
          finalEventId, 
          finalEstimateId, 
          finalMarketingId, 
          finalTemplateId, 
          finalCommentId,
          finalMessageId,
          finalUserId, 
          finalFolderId,
          finalChatRoomId,
          title,
          req.companyId
        );
        return res.send(result);
      }
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  // Handle chunked uploads
  const chunkFilename = getChunkFilename(identifier, chunkNumber);
  const chunkPath = path.join(__dirname, '../uploads', chunkFilename);

  if (!req.file) {
    return res.status(400).send({ success: false, err: 'No file uploaded.' });
  }

  const file = req.file;
  fs.renameSync(file.path, chunkPath); // Move file to correct location

  verifyChunks(identifier, totalChunks, async (isComplete) => {
    if (isComplete) {
      assembleChunks(identifier, filename, totalChunks, async (err, filePath) => {
        if (err) {
          return res.status(500).send({ success: false, err: err.message });
        }
        // Define the variables for the save function
        const type = req.body.type || 'documents';
        const title = req.body.title;
        const clientId = req.body.clientId;
        const eventId = req.body.eventId;
        const estimateId = req.body.estimateId;
        const marketingId = req.body.marketingId;
        const templateId = req.body.templateId;
        const folderId = req.body.folderId;
        const userId = req.body.userId;
        const messageId = req.body.messageId;
        const commentId = req.body.commentId;
        const chatRoomId = req.body.chatRoomId;
        const finalClientId = clientId && Number.isInteger(Number(clientId)) ? clientId : null;
        const finalEventId = eventId && Number.isInteger(Number(eventId)) ? eventId : null;
        const finalEstimateId = estimateId && Number.isInteger(Number(estimateId)) ? estimateId : null;
        const finalMarketingId = marketingId && Number.isInteger(Number(marketingId)) ? marketingId : null;
        const finalTemplateId = templateId && Number.isInteger(Number(templateId)) ? templateId : null;
        const finalUserId = userId && Number.isInteger(Number(userId)) ? userId : null;
        const finalFolderId = folderId && Number.isInteger(Number(folderId)) ? folderId : null;
        const finalMessageId = messageId && Number.isInteger(Number(messageId)) ? messageId : null;
        const finalCommentId = commentId && Number.isInteger(Number(commentId)) ? commentId : null;
        const finalChatRoomId = chatRoomId && Number.isInteger(Number(chatRoomId)) ? chatRoomId : null;
        try {
            // Call the common file saving logic
          const result = await handleFileSaving(
            file.path, 
            filename, 
            type, 
            finalClientId, 
            finalEventId, 
            finalEstimateId, 
            finalMarketingId, 
            finalTemplateId, 
            finalCommentId,
            finalMessageId,
            finalUserId, 
            finalFolderId,
            finalChatRoomId,
            title,
            req.companyId
          );
          return res.send(result);
        } catch (err) {
          return res.status(500).send({ success: false, err: err.message });
        }
      });
    } else {
      res.send({ success: true, msg: 'Chunk uploaded successfully' });
    }
  });
};

const uploadInvoicePdfToCloudinary = async (filePath, invoiceId) => {
  try {
    const folderPath = `invoices/${invoiceId}`;
    let filename = `invoice-${invoiceId}`;
    let counter = 0;
    let finalFilename = filename;
    
    // Check if file already exists and generate unique filename
    while (true) {
      try {
        // Try to get existing resource
        await cloudinary.api.resource(`${folderPath}/${finalFilename}`, { resource_type: 'raw' });
        // If we reach here, file exists, so increment counter
        counter++;
        finalFilename = `${filename}-${counter}`;
      } catch (error) {
        // If error is 'Not Found', then the filename is available
        if (error.http_code === 404) {
          break;
        }
        // If it's a different error, break and use the filename
        break;
      }
    }
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderPath,
      public_id: finalFilename,
      resource_type: 'auto',
      format: 'pdf'
    });
    
    // Clean up local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (err) {
    // Clean up temporary file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(err.message || 'Error uploading Invoice PDF to Cloudinary');
  }
};

module.exports = {
  handleFineUploaderUpload,
  upload,
  uploadPayrollPdfToCloudinary,
  uploadEstimatePdfToCloudinary,
  uploadInvoicePdfToCloudinary
};
