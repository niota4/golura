angular.module(
    'ngClientsFormat',
    []
)
.directive('formatClients', function() {
    return {
        restrict: 'A',
        scope: {
            clients: '=',
            client: '='
        },
        link: function(scope) {
            function setPrimaryField(fieldArray, primaryField, client) {
                if (fieldArray) {
                    var primaryItem = fieldArray.find(function(item) {
                        return item.isPrimary === true;
                    });
    
                    if (primaryItem) {
                        client[primaryField] = primaryItem;
                    }
                    else if (fieldArray.length > 0) {
                        client[primaryField] = fieldArray[fieldArray.length - 1];
                    }
                } else {
                    client[primaryField] = [];
                }
            }

            function processClients(clients) {
                clients.forEach(function(client) {
                    setPrimaryField(client.ClientAddresses, 'primaryAddress', client);
                    setPrimaryField(client.ClientPhoneNumbers, 'primaryPhoneNumber', client);
                    setPrimaryField(client.ClientEmails, 'primaryEmail', client);
                    if (!client.fullName) {
                        client.fullName = client.firstName + ' ' + client.lastName;
                    }
                    client.shortName = client.firstName.substring(0, 1) + client.lastName.substring(0, 1);
                });
            }
            function processClient(client) {
                setPrimaryField(client.ClientAddresses, 'primaryAddress', client);
                setPrimaryField(client.ClientPhoneNumbers, 'primaryPhoneNumber', client);
                setPrimaryField(client.ClientEmails, 'primaryEmail', client);
                if (!client.fullName) {
                    client.fullName = client.firstName + ' ' + client.lastName;
                };
                if (
                    client.firstName &&
                    client.lastName
                ) {
                    client.shortName = client.firstName.substring(0, 1) + client.lastName.substring(0, 1);
                };
            }

            scope.$watch('clients', function(newClient) {
                if (newClient) {
                    processClients(newClient);
                }
            }, true);
            scope.$watch('client', function(newClient) {
                if (newClient) {
                    processClient(newClient);
                }
            }, true);
        }
    };
});