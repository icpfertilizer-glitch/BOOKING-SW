const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

/**
 * Atomic booking creation with server-side overlap check.
 * Uses Firestore transaction to guarantee no double-booking.
 */
exports.createBooking = onCall({ region: "asia-southeast1" }, async (request) => {
  // Auth check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ต้อง login ก่อนจองห้องประชุม");
  }

  const uid = request.auth.uid;
  const { roomId, roomName, date, start, end, title, contact, bookerName } = request.data;

  // Validate required fields
  if (!roomId || !date || !start || !end) {
    throw new HttpsError("invalid-argument", "ข้อมูลไม่ครบ: roomId, date, start, end จำเป็น");
  }

  // Validate time format (HH:MM)
  const timeRe = /^\d{2}:\d{2}$/;
  if (!timeRe.test(start) || !timeRe.test(end)) {
    throw new HttpsError("invalid-argument", "รูปแบบเวลาไม่ถูกต้อง");
  }

  if (start >= end) {
    throw new HttpsError("invalid-argument", "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");
  }

  // Helper: check if two time ranges overlap
  function isOverlapping(s1, e1, s2, e2) {
    return s1 < e2 && s2 < e1;
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      // Read all meetings on the same date for the same room
      const meetingsRef = db.collection("meetings");
      const snapshot = await transaction.get(
        meetingsRef.where("date", "==", date).where("roomId", "==", roomId)
      );

      // Check for overlap
      const conflict = snapshot.docs.some((doc) => {
        const m = doc.data();
        return isOverlapping(start, end, m.start, m.end);
      });

      if (conflict) {
        throw new HttpsError(
          "already-exists",
          "ไม่สามารถจองได้: ช่วงเวลานี้ถูกจองแล้วสำหรับห้องนี้"
        );
      }

      // Create the booking atomically
      const newRef = meetingsRef.doc();
      transaction.set(newRef, {
        roomId,
        roomName: roomName || "",
        date,
        start,
        end,
        title: title || "",
        contact: contact || "",
        bookerName: bookerName || "",
        userId: uid,
        userName: bookerName || "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { id: newRef.id };
    });

    return { success: true, id: result.id };
  } catch (err) {
    // Re-throw HttpsError as-is
    if (err instanceof HttpsError) throw err;
    console.error("createBooking error:", err);
    throw new HttpsError("internal", "เกิดข้อผิดพลาดในการจอง: " + err.message);
  }
});

/**
 * Atomic booking update with server-side overlap check.
 */
exports.updateBooking = onCall({ region: "asia-southeast1" }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "ต้อง login ก่อน");
  }

  const uid = request.auth.uid;
  const { bookingId, roomId, roomName, date, start, end, title, contact, bookerName } = request.data;

  if (!bookingId || !roomId || !date || !start || !end) {
    throw new HttpsError("invalid-argument", "ข้อมูลไม่ครบ");
  }

  if (start >= end) {
    throw new HttpsError("invalid-argument", "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด");
  }

  function isOverlapping(s1, e1, s2, e2) {
    return s1 < e2 && s2 < e1;
  }

  try {
    await db.runTransaction(async (transaction) => {
      // Read the existing booking
      const bookingRef = db.collection("meetings").doc(bookingId);
      const bookingSnap = await transaction.get(bookingRef);

      if (!bookingSnap.exists) {
        throw new HttpsError("not-found", "ไม่พบรายการจองนี้");
      }

      const existing = bookingSnap.data();

      // Check permission: owner or admin
      const userSnap = await transaction.get(db.collection("users").doc(uid));
      const userRole = userSnap.exists ? userSnap.data().role : "";
      if (existing.userId !== uid && userRole !== "Admin") {
        throw new HttpsError("permission-denied", "คุณไม่มีสิทธิ์แก้ไขรายการนี้");
      }

      // Check overlap (exclude current booking)
      const snapshot = await transaction.get(
        db.collection("meetings").where("date", "==", date).where("roomId", "==", roomId)
      );

      const conflict = snapshot.docs.some((doc) => {
        if (doc.id === bookingId) return false;
        const m = doc.data();
        return isOverlapping(start, end, m.start, m.end);
      });

      if (conflict) {
        throw new HttpsError("already-exists", "ช่วงเวลานี้ถูกจองแล้ว");
      }

      transaction.update(bookingRef, {
        roomId,
        roomName: roomName || "",
        date,
        start,
        end,
        title: title || "",
        contact: contact || "",
        bookerName: bookerName || "",
        userId: existing.userId,
        userName: existing.userName,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { success: true };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error("updateBooking error:", err);
    throw new HttpsError("internal", "เกิดข้อผิดพลาด: " + err.message);
  }
});
