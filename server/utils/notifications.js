const supabase = require('../config/supabase');

/**
 * Create a new notification for a user
 * @param {string} userId - ID of the user to receive notification
 * @param {string} title - Title of notification
 * @param {string} message - Message body
 * @param {string} type - info|success|warning|error
 * @param {string} link - Optional link to related page
 */
const createNotification = async (userId, title, message, type = 'info', link = null) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert([{
                user_id: userId,
                title,
                message,
                type,
                link,
                is_read: false
            }]);

        if (error) {
            // PGRST205 = table not found - silently skip if table doesn't exist yet
            if (error.code === 'PGRST205') {
                return { success: false, skipped: true };
            }
            console.error('Error creating notification:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to create notification:', error);
        return { success: false, error };
    }
};

module.exports = { createNotification };
