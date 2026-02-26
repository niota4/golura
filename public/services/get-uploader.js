'use strict';

define(['fine-uploader'], function(qq) {
  angular.module('ngUploaders', [])
  .factory('$uploader', ['$q', '$rootScope', '$window', '$cookies', function($q, $rootScope, $window, $cookies) {
    // Get user from cookies first, fallback to localStorage for backward compatibility
    let user = $cookies.getObject('goluraUser');
    if (!user) {
      user = angular.fromJson($window.localStorage.getItem('goluraUser')) || angular.fromJson($window.localStorage.getItem('goluraPendingUser'));
    }

    function initializeFineUploader(clientId, eventId, marketingId, estimateId, type, onProgress, templateId, userId, subType, folderId, title, commentId, messageId, chatRoomId) {
      var endpoint = null;

      switch (type) {
        case 'companyLogo':
          endpoint = 'company';
        break;
        case 'email':
          endpoint = 'template';
        break;
        case 'pdf':
          endpoint = 'template';
        break;
        case 'user':
          endpoint = 'user';
        break;
        case 'userDrive':
          endpoint = 'user';
        break;
        case 'import':
          endpoint = 'import';
        break;
        case 'comment':
          endpoint = 'comment';
        break;
        case 'message':
          endpoint = 'message';
        break;
        case 'textMessage':
          endpoint = 'text-message';
        break;
        case 'event':
          endpoint = 'event';
        break;
        default:
          endpoint = 'client'
      }; 

      // Retrieve the user and token from localStorage
      var token = user && user.token ? user.token : null;

      const uploader = new qq.FineUploaderBasic({
        request: {
          endpoint: '/uploads/' + endpoint,
          params: {
            clientId: clientId,
            eventId: eventId,
            marketingId: marketingId,
            estimateId: estimateId,
            commentId: commentId,
            messageId: messageId,
            chatRoomId: chatRoomId,
            userId: userId,
            templateId: templateId,
            folderId: folderId,
            type: type,
            subType: subType,
            title: title,
          },
          customHeaders: {
            Authorization: 'Bearer ' + token // Add Bearer token to headers
          }
        },
        chunking: {
          enabled: true,
          partSize: 5 * 1024 * 1024 // 5MB
        },
        resume: {
          enabled: true
        },
        callbacks: {
          onProgress: function(id, fileName, uploadedBytes, totalBytes) {
            const progress = Math.round((uploadedBytes / totalBytes) * 100);
            onProgress(progress, fileName);
          },
          onComplete: function(id, fileName, responseJSON) {
            if (responseJSON.success) {
              console.log('File upload complete:', responseJSON);
            } else {
              console.error('File upload failed:', responseJSON.error);
            }
          },
          onError: function(id, name, errorReason, xhr) {
            console.error(`Error on file ${name}: ${errorReason}`);
          }
        }
      });
      return uploader;
    }

    function uploadFile(files, clientId, eventId, marketingId, estimateId, type, onProgress, templateId, userId, subType, folderId, title, commentId, messageId, chatRoomId) {

      if (type === 'userDrive') {
        userId = user.id;
      }
      return $q((resolve, reject) => {
        const uploader = initializeFineUploader(clientId, eventId, marketingId, estimateId, type, onProgress, templateId, userId, subType, folderId, title, commentId, messageId, chatRoomId);
        let completedFiles = 0;
        const totalFiles = files.length;
        const responses = [];

        uploader._options.callbacks.onComplete = function(id, fileName, responseJSON) {
          if (responseJSON.success) {
            console.log(responseJSON);
            responses.push({ fileName, err: false, msg: responseJSON.msg, url: responseJSON.media.url || null, count: responseJSON.count, media: responseJSON.media, type: type });
          } else {
            responses.push({ fileName, err: true, msg: responseJSON.error });
          }
          completedFiles++;
          if (completedFiles === totalFiles) {
            if (responses.some(response => response.err)) {
              reject(responses);
            } else {
              resolve(responses);
            }
          }
        };

        files.forEach(file => uploader.addFiles(file));
      });
    }
    return {
      uploadFile
    };
  }]);
});
