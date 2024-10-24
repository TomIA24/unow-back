const Cart = require("../models/Cart");
const { Candidat } = require("../models/Candidat");
const { sendPaymentConfirmationEmail } = require("../routes/emailSender");

const processPaidOrder = async (candidateId, itemId, itemType, order) => {
  try {
    await Cart.findOneAndDelete({
      condidate: candidateId,
      item: itemId,
      type: itemType,
    });

    order.status = "paid";
    await order.save();

    if (itemType === "training") {
      await Candidat.updateOne(
        { _id: candidateId },
        { $push: { TrainingsPaid: itemId } }
      );
    } else if (itemType === "course") {
      await Candidat.updateOne(
        { _id: candidateId },
        { $push: { CoursesPaid: itemId } }
      );
    }

    await sendPaymentConfirmationEmail(order.email, itemType);

    return { success: true, message: "paid order processed successfullyyyy." };
  } catch (error) {
    console.error("Error processing paid order:", error);
    throw new Error("Error processing paid order");
  }
};

module.exports = {
  processPaidOrder,
};
