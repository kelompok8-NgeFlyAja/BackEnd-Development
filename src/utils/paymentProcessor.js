const {snap, core} = require("../config/midtrans");

const expiryDate = new Date()
expiryDate.setMinutes(expiryDate.getMinutes() + 5)

const mandiriDetail = async (booking, itemDetails, totalPrice) => {
    const transactionDetails = {
        payment_type: "echannel",
        transaction_details: {
            order_id: booking.id,
            gross_amount: totalPrice,
        },
        customer_details: {
            first_name: `Booker: ${booking.bookerName}`,
            phone: booking.bookerPhone,
            billing_address: {
                address: `Email: ${booking.bookerEmail}`,
            },
        },
        item_details: itemDetails,
        echannel: {
            "bill_info1": "Payment:",
            "bill_info2": "Online Ticket Purchase",
        },
        expiry: {
            start_time: expiryDate.toISOString(),
            unit: "minute",
            duration: 5,
        },
    };

    const mandiriResponse = await core.charge(transactionDetails);
    return mandiriResponse;
};

const bcaDetail = async (booking, itemDetails, totalPrice) => {
    const transactionDetails = {
        payment_type: "bank_transfer",
        transaction_details: {
            order_id: booking.id,
            gross_amount: totalPrice,
        },
        customer_details: {
            first_name: `Booker: ${booking.bookerName}`,
            phone: booking.bookerPhone,
            billing_address: {
                address: `Email: ${booking.bookerEmail}`,
            },
        },
        item_details: itemDetails,
        bank_transfer: {
            "bank": "bca"
        },
    };

    const bcaResponse = await core.charge(transactionDetails);
    return bcaResponse;
};

const bniDetail = async (booking, itemDetails, totalPrice) => {
    const transactionDetails = {
        payment_type: "bank_transfer",
        transaction_details: {
            order_id: booking.id,
            gross_amount: totalPrice,
        },
        customer_details: {
            first_name: `Booker: ${booking.bookerName}`,
            phone: booking.bookerPhone,
            billing_address: {
                address: `Email: ${booking.bookerEmail}`,
            },
        },
        item_details: itemDetails,
        bank_transfer: {
            "bank": "bni"
        },
    };

    const bniResponse = await core.charge(transactionDetails);
    return bniResponse;
};

const briDetail = async (booking, itemDetails, totalPrice) => {
    const transactionDetails = {
        payment_type: "bank_transfer",
        transaction_details: {
            order_id: booking.id,
            gross_amount: totalPrice,
        },
        customer_details: {
            first_name: `Booker: ${booking.bookerName}`,
            phone: booking.bookerPhone,
            billing_address: {
                address: `Email: ${booking.bookerEmail}`,
            },
        },
        item_details: itemDetails,
        bank_transfer: {
            "bank": "bri"
        },
    };

    const briResponse = await core.charge(transactionDetails);
    return briResponse;
};

module.exports = {mandiriDetail, bcaDetail, bniDetail, briDetail};