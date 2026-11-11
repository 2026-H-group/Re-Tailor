document.addEventListener("DOMContentLoaded", () => {

    const items = new URLSearchParams(location.search).get("items") || "1";
    const confirmLink = document.getElementById("confirmLink");
    if (confirmLink) confirmLink.href = `confirm.html?items=${encodeURIComponent(items)}`;
    const catalog = window.reTailorProducts;
    const selected = items.split(",").map(Number).map((id) => catalog.find((item) => item.id === id)).filter(Boolean);
    const subtotal = selected.reduce((sum, item) => sum + item.price, 0);
    const formatYen = (value) => `¥${value.toLocaleString()}`;
    const name = document.getElementById("buyProductName");
    const price = document.querySelector(".product-price");
    const summary = document.querySelectorAll(".summary-list strong");
    if (name) name.textContent = selected.map((item) => item.name).join("、");
    if (price) price.textContent = formatYen(subtotal);
    if (summary[0]) summary[0].textContent = formatYen(subtotal);
    if (summary[2]) summary[2].textContent = formatYen(subtotal + 300);

    /* =========================
       住所の切り替え
    ========================== */

    const addressRadios =
        document.querySelectorAll(
            'input[name="address"]'
        );

    const registeredAddress =
        document.getElementById(
            "registered-address"
        );

    const newAddressForm =
        document.getElementById(
            "new-address-form"
        );


    function updateAddressForm() {

        const selected =
            document.querySelector(
                'input[name="address"]:checked'
            );


        if (!selected) {
            return;
        }


        if (selected.value === "new") {

            registeredAddress.style.display =
                "none";

            newAddressForm.classList.add(
                "active"
            );

        } else {

            registeredAddress.style.display =
                "block";

            newAddressForm.classList.remove(
                "active"
            );

        }

    }


    addressRadios.forEach((radio) => {

        radio.addEventListener(
            "change",
            updateAddressForm
        );

    });


    updateAddressForm();



    /* =========================
       支払い方法の切り替え
    ========================== */

    const paymentRadios =
        document.querySelectorAll(
            'input[name="payment"]'
        );

    const cardBox =
        document.getElementById(
            "card-box"
        );


    function updatePaymentForm() {

        const selected =
            document.querySelector(
                'input[name="payment"]:checked'
            );


        if (!selected) {
            return;
        }


        if (selected.value === "credit") {

            cardBox.style.display =
                "block";

        } else {

            cardBox.style.display =
                "none";

        }

    }


    paymentRadios.forEach((radio) => {

        radio.addEventListener(
            "change",
            updatePaymentForm
        );

    });


    updatePaymentForm();



    /* =========================
       カード番号の入力補助
    ========================== */

    const cardNumber =
        document.getElementById(
            "card-number"
        );


    cardNumber.addEventListener(
        "input",
        () => {

            let value =
                cardNumber.value
                    .replace(/\D/g, "")
                    .slice(0, 16);


            value =
                value.replace(
                    /(.{4})/g,
                    "$1 "
                )
                .trim();


            cardNumber.value =
                value;

        }
    );



    /* =========================
       郵便番号の入力補助
    ========================== */

    const postal =
        document.getElementById(
            "postal"
        );


    postal.addEventListener(
        "input",
        () => {

            let value =
                postal.value
                    .replace(/\D/g, "")
                    .slice(0, 7);


            if (value.length > 3) {

                value =
                    value.slice(0, 3)
                    + "-"
                    + value.slice(3);

            }


            postal.value =
                value;

        }
    );



    /* =========================
       確認画面への遷移
    ========================== */

    const confirmButton =
        document.querySelector(
            ".confirm-btn"
        );


    confirmButton.addEventListener(
        "click",
        (event) => {
            const error = document.getElementById("buyError");
            const fail = (message, field) => {
                event.preventDefault();
                error.textContent = message;
                field?.focus();
            };
            error.textContent = "";

            if (selected.length === 0) {
                fail("購入する商品を確認できません。商品一覧から選び直してください。", confirmButton);
                return;
            }

            const address = document.querySelector('input[name="address"]:checked');
            if (!address) {
                fail("配送先を選択してください。", addressRadios[0]);
                return;
            }
            if (address.value === "new") {
                const addressFields = [
                    document.getElementById("name"),
                    postal,
                    document.getElementById("prefecture"),
                    document.getElementById("address"),
                    document.getElementById("phone")
                ];
                const missing = addressFields.find((field) => !field.value.trim());
                if (missing) {
                    fail("新しい配送先の必須項目を入力してください。", missing);
                    return;
                }
                if (!/^\d{3}-?\d{4}$/.test(postal.value.trim())) {
                    fail("郵便番号を7桁で入力してください。", postal);
                    return;
                }
                const phoneDigits = document.getElementById("phone").value.replace(/\D/g, "");
                if (![10, 11].includes(phoneDigits.length)) {
                    fail("電話番号を10桁または11桁で入力してください。", document.getElementById("phone"));
                    return;
                }
            }

            const payment = document.querySelector('input[name="payment"]:checked');
            if (!payment) {
                fail("支払い方法を選択してください。", paymentRadios[0]);
                return;
            }
            if (payment.value === "credit") {
                const cardDigits = cardNumber.value.replace(/\D/g, "");
                if (cardDigits.length !== 16) {
                    fail("カード番号を16桁で入力してください。", cardNumber);
                    return;
                }
                const expiry = document.getElementById("expiry");
                const expiryMatch = expiry.value.trim().match(/^(\d{1,2})\s*\/\s*(\d{2})$/);
                if (!expiryMatch || Number(expiryMatch[1]) < 1 || Number(expiryMatch[1]) > 12) {
                    fail("有効期限をMM / YY形式で入力してください。", expiry);
                    return;
                }
                const holder = document.getElementById("holder");
                if (!holder.value.trim()) {
                    fail("カード名義人を入力してください。", holder);
                    return;
                }
                const security = document.getElementById("security");
                if (!/^\d{3,4}$/.test(security.value.trim())) {
                    fail("セキュリティコードを3桁または4桁で入力してください。", security);
                    return;
                }
            }

        }
    );

});