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

    var getContact = function(contactId, func) {
        return BaasBox.loadObject(CONTACK_COLLECTION, contactId)
            .done(function (res) {
                var contact = res.data;
                if (typeof func === "function") {
                    func(contact);
                }
            })
            .fail(function (res) {
                $.notify("Getting contact [" + contactId + "] failed");
            });
    };

    var updateContact = function (contact) {
        return getContact(contact.Id, null)
            .done(function(res) {
                var oldContact = res.data;
                $.print("# got contact");
                $.print(contact);

                contact = $.extend(oldContact, contact);

                $.print("# before update contact");
                $.print(oldContact);
                $.print(contact);
                return _updateContact(contact);
            });
    };

    return {
        createContact: createContact,
        createBlankContact: createBlankContact,
        getContact: getContact,
        updateContact: updateContact
    };
} ());