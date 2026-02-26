'use strict';

const { create } = require('lodash');

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('addresses', [
      { street1: '201 Commerce St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37201', latitude: '36.1612', longitude: '-86.7785', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1 Music Sq W', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1525', longitude: '-86.7929', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '150 3rd Ave S', street2: 'Suite 200', city: 'Nashville', stateId: 42, zipCode: '37201', latitude: '36.1591', longitude: '-86.7750', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '500 Church St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37219', latitude: '36.1642', longitude: '-86.7807', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '401 Cool Springs Blvd', street2: null, city: 'Franklin', stateId: 42, zipCode: '37067', latitude: '35.9397', longitude: '-86.8181', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '123 Gallatin Pike N', street2: null, city: 'Madison', stateId: 42, zipCode: '37115', latitude: '36.2557', longitude: '-86.7137', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1720 West End Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1523', longitude: '-86.7971', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1000 Corporate Centre Dr', street2: null, city: 'Franklin', stateId: 42, zipCode: '37067', latitude: '35.9335', longitude: '-86.8227', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '7106 Crossroads Blvd', street2: 'Suite 105', city: 'Brentwood', stateId: 42, zipCode: '37027', latitude: '36.0321', longitude: '-86.7917', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '3310 West End Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1353', longitude: '-86.8175', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1001 Broadway', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1563', longitude: '-86.7847', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '501 Union St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37219', latitude: '36.1623', longitude: '-86.7814', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '800 Crescent Centre Dr', street2: null, city: 'Franklin', stateId: 42, zipCode: '37067', latitude: '35.9401', longitude: '-86.8234', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '3451 Dickerson Pike', street2: null, city: 'Nashville', stateId: 42, zipCode: '37207', latitude: '36.2285', longitude: '-86.7641', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '3803 Nolensville Pike', street2: null, city: 'Nashville', stateId: 42, zipCode: '37211', latitude: '36.0989', longitude: '-86.7468', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2700 Gallatin Pike', street2: null, city: 'Nashville', stateId: 42, zipCode: '37216', latitude: '36.2094', longitude: '-86.7296', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2100 West End Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1537', longitude: '-86.8049', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '600 Marriott Dr', street2: null, city: 'Nashville', stateId: 42, zipCode: '37214', latitude: '36.1473', longitude: '-86.6944', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1311 6th Ave N', street2: null, city: 'Nashville', stateId: 42, zipCode: '37208', latitude: '36.1807', longitude: '-86.7884', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '4515 Harding Pike', street2: null, city: 'Nashville', stateId: 42, zipCode: '37205', latitude: '36.1258', longitude: '-86.8517', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '120 7th Ave N', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1628', longitude: '-86.7835', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2100 Charlotte Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1576', longitude: '-86.8124', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2505 21st Ave S', street2: null, city: 'Nashville', stateId: 42, zipCode: '37212', latitude: '36.1268', longitude: '-86.8005', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1310 Clinton St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1641', longitude: '-86.7972', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '807 Woodland St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37206', latitude: '36.1766', longitude: '-86.7551', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '330 Franklin Rd', street2: null, city: 'Brentwood', stateId: 42, zipCode: '37027', latitude: '36.0334', longitude: '-86.7936', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1200 Villa Pl', street2: null, city: 'Nashville', stateId: 42, zipCode: '37212', latitude: '36.1423', longitude: '-86.7941', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2000 Richard Jones Rd', street2: 'Suite 300', city: 'Nashville', stateId: 42, zipCode: '37215', latitude: '36.1068', longitude: '-86.8161', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '315 Deaderick St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37238', latitude: '36.1664', longitude: '-86.7829', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '401 11th Ave S', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1572', longitude: '-86.7889', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2825 Columbine Pl', street2: null, city: 'Nashville', stateId: 42, zipCode: '37204', latitude: '36.1202', longitude: '-86.7756', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '720 Rundle Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37210', latitude: '36.1426', longitude: '-86.7424', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1801 West End Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1529', longitude: '-86.7981', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1700 Medical Center Pkwy', street2: null, city: 'Murfreesboro', stateId: 42, zipCode: '37129', latitude: '35.8674', longitude: '-86.3963', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '209 10th Ave S', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1544', longitude: '-86.7873', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2400 Patterson St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1532', longitude: '-86.8074', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '100 Cool Springs Blvd', street2: null, city: 'Franklin', stateId: 42, zipCode: '37067', latitude: '35.9440', longitude: '-86.8277', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1900 Church St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1581', longitude: '-86.7978', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '750 Old Hickory Blvd', street2: null, city: 'Brentwood', stateId: 42, zipCode: '37027', latitude: '36.0412', longitude: '-86.7985', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2310 Elm Hill Pike', street2: null, city: 'Nashville', stateId: 42, zipCode: '37214', latitude: '36.1604', longitude: '-86.6825', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '5000 Harding Pl', street2: null, city: 'Nashville', stateId: 42, zipCode: '37211', latitude: '36.0944', longitude: '-86.7383', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1721 West End Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1526', longitude: '-86.7968', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '3100 West End Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1343', longitude: '-86.8183', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '1122 3rd Ave S', street2: null, city: 'Nashville', stateId: 42, zipCode: '37210', latitude: '36.1506', longitude: '-86.7659', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '737 McFerrin Ave', street2: null, city: 'Nashville', stateId: 42, zipCode: '37206', latitude: '36.1802', longitude: '-86.7579', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2115 Yeaman Pl', street2: null, city: 'Nashville', stateId: 42, zipCode: '37206', latitude: '36.1755', longitude: '-86.7561', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '701 Division St', street2: null, city: 'Nashville', stateId: 42, zipCode: '37203', latitude: '36.1574', longitude: '-86.7846', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '2501 McGavock Pike', street2: null, city: 'Nashville', stateId: 42, zipCode: '37214', latitude: '36.1649', longitude: '-86.6948', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '300 4th Ave N', street2: null, city: 'Nashville', stateId: 42, zipCode: '37219', latitude: '36.1652', longitude: '-86.7823', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { street1: '100 Powell Pl', street2: null, city: 'Brentwood', stateId: 42, zipCode: '37027', latitude: '36.0375', longitude: '-86.7834', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('addresses', null, {});
  }
};
