// Set up AJAX defaults
$.ajaxSetup({
    contentType: 'application/json',
    dataType: 'json'
});

// Enroll in a course
function enrollCourse(courseId, btnEl) {
    const $btn = $(btnEl);
    $btn.html('<span class="spinner-border spinner-border-sm mr-2"></span>Enrolling...');
    $btn.prop('disabled', true);

    $.ajax({
        type: 'POST',
        url: `/courses/${courseId}/enroll`,
        success: function(response) {
            $btn.text('Enrolled ✓');
            $btn.addClass('btn-success').removeClass('btn-primary');
            $btn.prop('disabled', true);
            if (response.slots !== undefined) {
                $btn.closest('tr').find('.slot-count').text(response.slots);
            }
        },
        error: function(xhr) {
            $btn.html('Enroll');
            $btn.prop('disabled', false);
            const message = xhr.responseJSON?.message || 'Failed to enroll. Please try again.';
            $('#errorModal .modal-body').text(message);
            $('#errorModal').modal('show');
        }
    });
}

// Drop a course
function dropCourse(courseId, rowEl) {
    if (!confirm('Are you sure you want to drop this course?')) return;

    $.ajax({
        type: 'DELETE',
        url: `/courses/${courseId}/drop`,
        success: function() {
            $(rowEl).slideUp(300, function() {
                $(this).remove();
            });
            showToast('Course dropped successfully');
        },
        error: function(xhr) {
            const message = xhr.responseJSON?.message || 'Failed to drop course.';
            alert(message);
        }
    });
}

// Delete a notice
function deleteNotice(noticeId, itemEl) {
    if (!confirm('Delete this notice?')) return;

    $.ajax({
        type: 'DELETE',
        url: `/notices/${noticeId}`,
        success: function() {
            $(itemEl).slideUp(300, function() {
                $(this).remove();
            });
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.message || 'Failed to delete notice.');
        }
    });
}

// Pin/Unpin a notice
function pinNotice(noticeId, btnEl) {
    const $btn = $(btnEl);
    const isFilled = $btn.text().includes('★');

    $.ajax({
        type: 'PUT',
        url: `/notices/${noticeId}/pin`,
        success: function() {
            $btn.text(isFilled ? '☆' : '★');
            const $item = $btn.closest('.notice-item');
            $item.prependTo($item.parent());
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.message || 'Failed to pin notice.');
        }
    });
}

// Delete a user
function deleteUser(userId, rowEl) {
    if (!confirm('Delete this user? This cannot be undone.')) return;

    $.ajax({
        type: 'DELETE',
        url: `/admin/users/${userId}`,
        success: function() {
            $(rowEl).slideUp(300, function() {
                $(this).remove();
            });
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.message || 'Failed to delete user.');
        }
    });
}

// Update user role
function updateUserRole(userId, newRole) {
    $.ajax({
        type: 'PUT',
        url: `/admin/users/${userId}/role`,
        data: JSON.stringify({ role: newRole }),
        success: function(response) {
            const $row = $(`tr[data-user-id="${userId}"]`);
            const $badge = $row.find('.role-badge');
            $badge.text(newRole);
            $badge.removeClass().addClass(`badge role-badge badge-${getRoleBadgeClass(newRole)}`);
        },
        error: function(xhr) {
            alert(xhr.responseJSON?.message || 'Failed to update role.');
        }
    });
}

// Helper: Show toast notification
function showToast(message) {
    const toast = `<div class="toast" role="alert"><div class="toast-body">${message}</div></div>`;
    $(toast).appendTo('body').delay(3000).fadeOut(300);
}

// Helper: Get badge class based on role
function getRoleBadgeClass(role) {
    const map = { admin: 'danger', teacher: 'info', student: 'primary' };
    return map[role] || 'secondary';
}