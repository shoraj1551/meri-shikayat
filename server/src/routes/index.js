import auth from './auth.routes.js';
import registration from './registration.routes.js';
import users from './user.routes.js';
import complaints from './complaint.routes.js';
import location from './location.routes.js';
import admin from './admin.routes.js';
import social from './social.routes.js';
import stories from './stories.routes.js';
import departments from './departments.js';
import contractors from './contractors.js';
import profile from './profile.routes.js';
import verification from './verification.routes.js';
import categories from './category.routes.js';
import notifications from './notification.routes.js';

export default [
    ['/auth', auth], ['/auth', registration], ['/users', users],
    ['/complaints', complaints], ['/location', location], ['/admin', admin],
    ['/social', social], ['/stories', stories], ['/departments', departments],
    ['/contractors', contractors], ['/profile', profile], ['/verification', verification],
    ['/categories', categories], ['/notifications', notifications]
];
