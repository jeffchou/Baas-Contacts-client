BaasContact.Models.Contacts = (function () {
    var createBlankContact = function () {
        return {
            employeeId: 0,
            name: "",
            department : "",
            extNo: "",
            email: "",
            mobileNo: "",
            birthDay: "",
            address: ""
        };
    };

    var _updateContact = function(contact) {
        return BaasBox.save(contact, CONTACK_COLLECTION);
    };

    var createContact = function(info) {
        var contact = createBlankContact();
        contact.email = info.email;
        contact.name = info.name;
        contact.employeeId = (new Date()).getTime();

        return _updateContact(contact);
    };

    return {
        createContact: createContact
    };
} ());