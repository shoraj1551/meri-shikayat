const ADMIN_ROOM = 'admin_notifications';

const serializeId = value => value == null ? null : String(value);

export function createNewComplaintPayload(complaint) {
    return {
        id: serializeId(complaint?._id),
        complaintId: complaint?.complaintId,
        title: complaint?.title,
        status: complaint?.status,
        priority: complaint?.priority,
        categoryId: serializeId(complaint?.category?._id || complaint?.category),
        createdAt: complaint?.createdAt
    };
}

export function createStatusUpdatePayload(complaint) {
    return {
        id: serializeId(complaint?._id),
        complaintId: complaint?.complaintId,
        status: complaint?.status,
        updatedAt: complaint?.updatedAt
    };
}

function emitToAdmins(req, event, payload) {
    const io = req.app.get('io');
    if (!io) return false;
    try {
        io.to(ADMIN_ROOM).emit(event, payload);
        return true;
    } catch (error) {
        console.error(`Realtime ${event} delivery failed:`, error.message);
        return false;
    }
}

export function emitNewComplaint(req, complaint) {
    return emitToAdmins(req, 'new_complaint', createNewComplaintPayload(complaint));
}

export function emitComplaintStatusUpdate(req, complaint) {
    return emitToAdmins(req, 'complaint_status_update', createStatusUpdatePayload(complaint));
}
