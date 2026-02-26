'use strict';

angular.module('ngSelectizeOptions', [])
.factory(
    '$selectizeOptions', 
    [
        function (
        ) {

            return {
                stateOptions: {
                    sortField: 'name',
                    create: false,
                    placeholder: "Select A State",
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1
                },
                rolesOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a role',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                typeOptions: {
                    sortField: 'id',
                    create: false,
                    placeholder: 'Select a type',
                    valueField: 'id',
                    labelField: 'name',
                    maxItems: 1,
                },
                groupUsersOptions: {
                    delimiter: ',',
                    sortField: 'id',
                    create: false,
                    placeholder: 'Add Users',
                    valueField: 'id',
                    labelField: 'fullName',
                    persist: false,
                },
                eventTypeTagOptions: {
                    delimiter: ',',
                    placeholder: 'Add Tags',
                    persist: false,
                    maxItems: 25,
                    create: function (input) {
                        return {
                            value: input,
                            text: input,
                        };
                    },  
                },
                eventTypeRoleOptions: {
                    delimiter: ',',
                    sortField: 'id',
                    create: false,
                    placeholder: 'Add Roles',
                    valueField: 'id',
                    labelField: 'name',
                    persist: false,
                },
            }
        }
    ]
);