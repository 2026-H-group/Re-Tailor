"use strict";

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
        return;
    }

    const contacts = JSON.parse(localStorage.getItem("retailorAdminContacts") || "[]");
    const values = Object.fromEntries(new FormData(contactForm).entries());
    contacts.unshift({
        ...values,
        id: `CT-${Date.now()}`,
        received: new Date().toISOString(),
        status: "未対応"
    });
    localStorage.setItem("retailorAdminContacts", JSON.stringify(contacts));
    window.location.assign("contact-complete.html");
});