const generateInvoice = (order) => {
    let itemsStr = '';
    order.orderItems.forEach((item, index) => {
        itemsStr += `${index + 1}. ${item.book ? item.book.title : 'Combo'} - Qty: ${item.quantity} x ${item.unitPrice} \n`;
    });

    return `
=========================================
        PATHDIGONTO BOOK HUB
             INVOICE
=========================================
Order No: ${order.orderNumber}
Date: ${order.createdAt.toISOString().split('T')[0]}
Customer: ${order.user.name} (${order.user.email})

Shipping Address:
${order.address.title ? order.address.title + ' - ' : ''}${order.address.phone}
${order.address.addressLine}${!order.address.isInsideDhaka && order.address.district ? `, ${order.address.thana}, ${order.address.district}` : ''}

Items:
${itemsStr}
-----------------------------------------
Subtotal:       ${order.subtotal}
Discount/Points: -${order.pointsUsed}
Grand Total:    ${order.grandTotal}
Payment Method: ${order.paymentMethod}
Status:         ${order.orderStatus}
=========================================
Thank you for shopping with us!
    `;
};

module.exports = { generateInvoice };
