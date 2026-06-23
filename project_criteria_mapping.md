# College Portal — Criteria-to-Code Mapping

A comprehensive reference showing exactly **where** each grading criterion lives in the project and **how** it is used.

---

## 📁 Project Directory Structure (Overview)

```
College-portal/
├── app.js                        ← Express server entry point
├── config/
│   ├── db.js                     ← MongoDB connection
│   ├── facultyRegistry.js        ← Approved faculty list
│   └── upload.js                 ← Multer file upload config
├── controllers/
│   ├── adminController.js        ← Admin panel, users, reports
│   ├── authController.js         ← Login, signup, password reset
│   ├── courseController.js        ← Course CRUD, enroll, drop
│   ├── facultyController.js      ← Faculty dashboard, grading
│   ├── noticeController.js        ← Notice CRUD, pin/unpin
│   └── studentController.js       ← Student dashboard, grades, profile
├── middleware/
│   ├── authMiddleware.js          ← Session-based authentication
│   └── roleMiddleware.js          ← Role-based access control
├── models/
│   ├── Assignment.js
│   ├── Course.js
│   ├── Enrollment.js
│   ├── Notice.js
│   ├── Student.js
│   ├── Submission.js
│   └── User.js
├── public/
│   ├── css/style.css              ← Custom CSS + Dark Mode + RWD
│   └── js/
│       ├── ajax.js                ← jQuery AJAX calls
│       ├── app.js                 ← AngularJS module + controllers
│       ├── main.js                ← jQuery UI effects + helpers
│       └── validation.js          ← Client-side form validation
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── facultyRoutes.js
│   ├── noticeRoutes.js
│   └── studentRoutes.js
└── views/
    ├── admin/          (panel, users, courses, notices, reports, faculty-registry)
    ├── auth/           (login, signup, forgot-password, reset-password)
    ├── courses/        (list, enroll)
    ├── faculty/        (dashboard, course-details, submissions)
    ├── layouts/main.ejs
    ├── notices/index.ejs
    ├── partials/       (navbar, footer)
    └── student/        (dashboard, profile, grades, assignments)
```

---

## 🖥️ Front-End (10 Marks)

---

### 1. MVC — View Layer

| Detail | Description |
|---|---|
| **Where** | `views/` directory — all `.ejs` files |
| **Key files** | `views/auth/login.ejs`, `views/auth/signup.ejs`, `views/student/dashboard.ejs`, `views/faculty/dashboard.ejs`, `views/admin/panel.ejs`, `views/courses/list.ejs`, `views/notices/index.ejs` |
| **Layout** | [views/layouts/main.ejs](file:///c:/Users/anwes/Desktop/College-portal/views/layouts/main.ejs) — master layout wrapping all pages via `express-ejs-layouts`; includes navbar, footer, Bootstrap CDN, and custom CSS |
| **Partials** | [views/partials/navbar.ejs](file:///c:/Users/anwes/Desktop/College-portal/views/partials/navbar.ejs), [views/partials/footer.ejs](file:///c:/Users/anwes/Desktop/College-portal/views/partials/footer.ejs) — shared across all pages via `<%- include() %>` |
| **How it works** | EJS templates are the **View** in the MVC pattern. Controllers fetch data from Models (MongoDB via Mongoose) and pass it to views using `res.render('viewName', { data })`. Views use EJS tags (`<%= %>`, `<%- %>`, `<% %>`) to dynamically render server-supplied data. The layout engine (`express-ejs-layouts`) injects each page's content into a `<%- body %>` placeholder in `main.ejs`. |

---

### 2. HTML/CSS + Bootstrap

| Detail | Description |
|---|---|
| **Bootstrap 5 CDN** | [views/layouts/main.ejs:9](file:///c:/Users/anwes/Desktop/College-portal/views/layouts/main.ejs#L9) — loads `bootstrap@5.3.0` CSS |
| **Bootstrap JS** | [views/layouts/main.ejs:43](file:///c:/Users/anwes/Desktop/College-portal/views/layouts/main.ejs#L43) — loads `bootstrap.bundle.min.js` |
| **Bootstrap Icons** | [views/layouts/main.ejs:12](file:///c:/Users/anwes/Desktop/College-portal/views/layouts/main.ejs#L12) — `bootstrap-icons@1.10.5` |
| **Custom CSS** | [public/css/style.css](file:///c:/Users/anwes/Desktop/College-portal/public/css/style.css) — 489 lines of custom styling |
| **How it works** | Every EJS view uses Bootstrap 5 classes extensively — `container`, `row`, `col-*`, `card`, `btn`, `form-control`, `table`, `navbar`, `modal`, `alert`, `badge`, `progress`, etc. The custom `style.css` provides: CSS custom properties (lines 1–12), navbar gradient (lines 51–88), auth card styling (lines 91–128), stat cards with hover effects (lines 131–155), grade badges (lines 157–185), footer styling (lines 188–209), animation keyframes (`fadeIn`, `slideUp`, `slideUnderline`), and a complete dark mode theme (lines 280–489). |

---

### 3. JavaScript / jQuery

| Detail | Description |
|---|---|
| **Where** | [public/js/main.js](file:///c:/Users/anwes/Desktop/College-portal/public/js/main.js) (80 lines), [public/js/ajax.js](file:///c:/Users/anwes/Desktop/College-portal/public/js/ajax.js) (137 lines) |
| **jQuery effects used** | `.fadeIn()` — staggered card animation (main.js:3–5); `.fadeOut()` — auto-dismiss alerts (main.js:64), toast notifications (ajax.js:130); `.slideUp()` — animate row removal on delete/drop (ajax.js:42, 62, 99) |
| **jQuery selectors** | `$('.card')`, `$('.navbar-nav a')`, `$('[data-target]')`, `$('.alert')`, `$('#toast-container')`, `$('a[href^="#"]')` |
| **Event handlers** | `.on('click', '.btn-delete', ...)` — delegated delete confirmation (main.js:55); `.on('click', ...)` — smooth scroll (main.js:71); `$btn.prop('disabled', true)` — button state management (ajax.js:11) |
| **Animated counters** | main.js:36–52 — uses `setInterval` + `$('[data-target]')` to count up stat-card numbers |
| **Toast system** | main.js:18–33 — `showToast()` dynamically creates Bootstrap toast elements with jQuery, appends to the DOM |
| **How it works** | jQuery is used for DOM manipulation, animations, and user interaction feedback. `main.js` handles page-level effects like staggered card fade-ins, active nav detection, animated stat counters, and alert auto-dismiss. `ajax.js` focuses on AJAX calls (see item 8). |

---

### 4. AngularJS

| Detail | Description |
|---|---|
| **Where** | [public/js/app.js](file:///c:/Users/anwes/Desktop/College-portal/public/js/app.js) (99 lines) |
| **Module** | `angular.module('CollegeApp', ['ngRoute'])` — AngularJS app with routing (app.js:2) |
| **`ng-app`** | Used on the HTML element to bootstrap the Angular app as `CollegeApp` |
| **`$routeProvider`** | app.js:3–23 — configures client-side routes: `/dashboard`, `/courses`, `/grades`, `/notices`, each with a `templateUrl` and `controller` |
| **Controllers** | `DashboardCtrl` (line 26) — loads enrollments via `$http.get('/api/enrollments')`, implements `$scope.dropCourse()`; `CoursesCtrl` (line 43) — loads courses, implements `$scope.enroll()`; `GradesCtrl` (line 60) — loads grades, computes GPA via computed property; `NoticesCtrl` (line 79) — loads notices, implements `$scope.pinNotice()` and `$scope.deleteNotice()` |
| **Directives used** | `ng-repeat` — iterates over `$scope.courses`, `$scope.enrollments`, `$scope.grades`, `$scope.notices`; `ng-model` — two-way binding for `search`, `filterDept`, `searchCourse`, `searchKeyword`; `ng-controller` — assigns controllers to views |
| **`$http` service** | Used for all API calls: `$http.get()`, `$http.post()`, `$http.put()`, `$http.delete()` |
| **`$scope`** | All data binding goes through `$scope` — arrays for lists, functions for actions, and computed properties for GPA calculation |
| **How it works** | The AngularJS module provides a client-side SPA layer with routing between dashboard, courses, grades, and notices views. Each controller uses `$http` to fetch JSON data from server APIs and binds it to `$scope` for template rendering with `ng-repeat`. `ng-model` enables live search/filter on lists. |

---

### 5. Form Validation

| Detail | Description |
|---|---|
| **Client-side (jQuery)** | [public/js/validation.js](file:///c:/Users/anwes/Desktop/College-portal/public/js/validation.js) (166 lines) |
| **Login validation** | Lines 17–47 — `validateLoginForm()`: checks email format with regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, ensures password ≥ 6 chars; adds Bootstrap `is-invalid`/`is-valid` classes |
| **Signup validation** | Lines 50–113 — `validateSignupForm()`: validates name (≥ 2 chars), email (regex), role selection, password (≥ 8 chars), and confirm password match |
| **Password strength meter** | Lines 116–139 — `passwordStrengthMeter()`: real-time scoring (length, uppercase, digits, special chars) with color-coded progress bar (`bg-danger` → `bg-warning` → `bg-success`) |
| **Error display** | `showFieldError()` / `clearFieldError()` helper functions add/remove Bootstrap validation classes and update `.invalid-feedback` text |
| **Form interception** | Lines 142–165 — attaches `submit` event handlers to `#loginForm` and `#signupForm`, calls `e.preventDefault()`, runs validation, and only submits if valid |
| **Server-side** | [controllers/authController.js](file:///c:/Users/anwes/Desktop/College-portal/controllers/authController.js) — uses `express-validator` (`body()`, `validationResult()`); validates email format (`isEmail`), name (`notEmpty`), password length (`isLength({ min: 8 })`), and role (`isIn(['student', 'faculty'])`) at lines 22–25 (signup) and 138–139 (login). If validation fails, re-renders the form with error messages |
| **How it works** | Two-layer validation: jQuery intercepts form submission on the client, validates fields with regex and length checks, and shows inline feedback via Bootstrap's validation classes. If client-side passes, the form submits to the server where `express-validator` middleware re-validates all fields. Invalid server-side submissions re-render the form with `errors.array()`. |

---

### 6. Responsive Web Design (RWD)

| Detail | Description |
|---|---|
| **Viewport meta** | [views/layouts/main.ejs:5](file:///c:/Users/anwes/Desktop/College-portal/views/layouts/main.ejs#L5) — `<meta name="viewport" content="width=device-width, initial-scale=1.0">` |
| **Bootstrap grid** | Used throughout views — `col-md-*`, `col-lg-*`, `col-sm-*` for responsive column layouts (e.g., course cards, stat cards, sidebar layouts) |
| **Responsive navbar** | [views/partials/navbar.ejs:1](file:///c:/Users/anwes/Desktop/College-portal/views/partials/navbar.ejs#L1) — `navbar-expand-lg` collapses to hamburger on smaller screens; `navbar-toggler` button with `data-bs-toggle="collapse"` |
| **CSS `clamp()`** | style.css:29 — `font-size: clamp(14px, 2.5vw, 16px)` for fluid base font; h1/h2/h3 headings use clamp for fluid sizing (lines 233–247); stat cards use clamp (lines 146, 152) |
| **CSS media queries** | style.css:254–258 — `@media (min-width: 576px)` for container padding; style.css:261–278 — `@media (max-width: 480px)` to adjust body font size, auth card padding, stat card margins, and navbar brand size |
| **Responsive grid layout** | Courses enroll page uses `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` for automatic column wrapping |
| **How it works** | Mobile-first approach: base styles target small screens, then media queries and Bootstrap's grid system scale up for larger viewports. The navbar auto-collapses to a toggleable hamburger menu. `clamp()` provides fluid typography that smoothly scales between min and max values. Bootstrap utility classes like `d-flex`, `justify-content-between`, `mt-lg-0` handle responsive spacing. |

---

### 7. JSON

| Detail | Description |
|---|---|
| **Server sends JSON** | All AJAX endpoints return JSON: `res.json({ success: true })` in [courseController.js](file:///c:/Users/anwes/Desktop/College-portal/controllers/courseController.js) (enroll:132, drop:156); `res.json({ isPinned })` in [noticeController.js:82](file:///c:/Users/anwes/Desktop/College-portal/controllers/noticeController.js#L82); `res.json({ success: true, role })` in [adminController.js:53](file:///c:/Users/anwes/Desktop/College-portal/controllers/adminController.js#L53) |
| **Client sends JSON** | [ajax.js:2–5](file:///c:/Users/anwes/Desktop/College-portal/public/js/ajax.js#L2) — `$.ajaxSetup({ contentType: 'application/json', dataType: 'json' })` configures all jQuery AJAX to send/receive JSON; ajax.js:114 — `JSON.stringify({ role: newRole })` for role updates |
| **Express JSON parsing** | [app.js:19](file:///c:/Users/anwes/Desktop/College-portal/app.js#L19) — `app.use(express.json())` enables JSON body parsing for incoming requests |
| **AngularJS JSON** | [public/js/app.js](file:///c:/Users/anwes/Desktop/College-portal/public/js/app.js) — `$http.get('/api/courses')` and `$http.post('/api/enrollments', { courseId })` all communicate via JSON |
| **Notice API** | [noticeController.js:16–17](file:///c:/Users/anwes/Desktop/College-portal/controllers/noticeController.js#L16) — detects AJAX requests and returns notices as JSON array: `return res.json(notices)` |
| **How it works** | JSON is the data interchange format for all asynchronous communication. The Express server parses incoming JSON bodies via `express.json()` middleware and sends JSON responses via `res.json()`. The client-side jQuery AJAX is globally configured to use `application/json` content type. AngularJS `$http` service also sends/receives JSON natively. |

---

### 8. AJAX

| Detail | Description |
|---|---|
| **Where** | [public/js/ajax.js](file:///c:/Users/anwes/Desktop/College-portal/public/js/ajax.js) (137 lines) |
| **Enroll in course** | Lines 8–31 — `enrollCourse(courseId, btnEl)`: `$.ajax({ type: 'POST', url: '/courses/${courseId}/enroll' })` — shows spinner during request, swaps button to "Enrolled ✓" on success, shows error modal on failure |
| **Drop course** | Lines 35–51 — `dropCourse(courseId, rowEl)`: `$.ajax({ type: 'DELETE', url: '/courses/${courseId}/drop' })` — confirms with dialog, animates row removal with `$(rowEl).slideUp(300)`, shows toast |
| **Delete notice** | Lines 55–69 — `deleteNotice(noticeId, itemEl)`: `$.ajax({ type: 'DELETE', url: '/notices/${noticeId}' })` — confirms, slides item up |
| **Pin/Unpin notice** | Lines 73–88 — `pinNotice(noticeId, btnEl)`: `$.ajax({ type: 'PUT', url: '/notices/${noticeId}/pin' })` — toggles star icon ☆/★, moves item to top |
| **Delete user** | Lines 92–106 — `deleteUser(userId, rowEl)`: `$.ajax({ type: 'DELETE', url: '/admin/users/${userId}' })` — confirms, slides row up |
| **Update role** | Lines 110–124 — `updateUserRole(userId, newRole)`: `$.ajax({ type: 'PUT', url: '/admin/users/${userId}/role', data: JSON.stringify({ role }) })` — updates badge text and class |
| **How it works** | All six AJAX operations use jQuery `$.ajax()` to communicate with server-side Express routes **without page reload**. Each function accepts DOM element references to provide inline UI feedback (spinners, button state changes, slide animations, toast notifications). `$.ajaxSetup()` globally sets JSON content type. Error responses display the server's error message via modals or alerts. |

---

## ⚙️ Back-End (10 Marks)

---

### 1. MVC — Full Structure

| Layer | Location | Description |
|---|---|---|
| **Models** | [models/](file:///c:/Users/anwes/Desktop/College-portal/models) | 7 Mongoose schema files defining MongoDB document structure: [User.js](file:///c:/Users/anwes/Desktop/College-portal/models/User.js), [Student.js](file:///c:/Users/anwes/Desktop/College-portal/models/Student.js), [Course.js](file:///c:/Users/anwes/Desktop/College-portal/models/Course.js), [Enrollment.js](file:///c:/Users/anwes/Desktop/College-portal/models/Enrollment.js), [Notice.js](file:///c:/Users/anwes/Desktop/College-portal/models/Notice.js), [Assignment.js](file:///c:/Users/anwes/Desktop/College-portal/models/Assignment.js), [Submission.js](file:///c:/Users/anwes/Desktop/College-portal/models/Submission.js) |
| **Views** | [views/](file:///c:/Users/anwes/Desktop/College-portal/views) | 20+ EJS templates across 8 subdirectories (`admin/`, `auth/`, `courses/`, `faculty/`, `layouts/`, `notices/`, `partials/`, `student/`) |
| **Controllers** | [controllers/](file:///c:/Users/anwes/Desktop/College-portal/controllers) | 6 controller files: `authController`, `adminController`, `courseController`, `facultyController`, `noticeController`, `studentController` |
| **How it works** | Routes (in `routes/`) map HTTP requests → Controller functions → Controller queries Models (Mongoose) → Controller calls `res.render()` with data to render Views. Example flow: `GET /student/dashboard` → `studentRoutes.js` → `studentController.getDashboard()` → queries `User`, `Student`, `Enrollment`, `Notice` models → renders `views/student/dashboard.ejs` with results |

---

### 2. Server / Node / Express

| Detail | Description |
|---|---|
| **Where** | [app.js](file:///c:/Users/anwes/Desktop/College-portal/app.js) (73 lines) |
| **Express setup** | Line 11 — `const app = express()` |
| **Middleware stack** | `morgan('dev')` (logging, line 17), `express.urlencoded()` (form parsing, line 18), `express.json()` (JSON parsing, line 19), `express.static('public')` (static files, line 20), `method-override('_method')` (PUT/DELETE support, line 21) |
| **View engine** | Lines 53–55 — `app.set('view engine', 'ejs')` with `express-ejs-layouts` and layout set to `layouts/main` |
| **User middleware** | Lines 32–49 — custom middleware populates `req.user` from session on every request and exposes it to views via `res.locals.user` |
| **Route mounting** | Lines 62–67 — six route modules mounted: `/auth`, `/student`, `/faculty`, `/courses`, `/notices`, `/admin` |
| **Server start** | Lines 70–73 — `app.listen(PORT)` starts the server on port 3000 (or `process.env.PORT`) |
| **Dependencies** | [package.json](file:///c:/Users/anwes/Desktop/College-portal/package.json) — `express@4.22.1`, `ejs@3.1.10`, `mongoose@7.8.9`, `express-session`, `express-validator`, `bcryptjs`, `multer`, `morgan`, `method-override` |

---

### 3. MongoDB — Collections

| Collection | Model file | Schema fields | Purpose |
|---|---|---|---|
| **Users** | [models/User.js](file:///c:/Users/anwes/Desktop/College-portal/models/User.js) | `name`, `email` (unique), `password`, `role` (enum: student/faculty/admin), `department`, `facultyId`, `plainPassword` | Stores all user accounts; pre-save hook hashes password with bcrypt |
| **Students** | [models/Student.js](file:///c:/Users/anwes/Desktop/College-portal/models/Student.js) | `userId` (ref→User), `rollNumber` (unique), `department`, `semester`, `grades[]` (courseId+grade+marks), `gpa`, `attendancePercent` | Extended student profile linked to User; stores grades as embedded subdocuments |
| **Courses** | [models/Course.js](file:///c:/Users/anwes/Desktop/College-portal/models/Course.js) | `title`, `code` (unique), `description`, `credits`, `department`, `facultyId` (ref→User), `totalSlots`, `enrolledCount`, `schedule`, `isActive` | Course catalog; tracks enrollment capacity and assigned faculty |
| **Enrollments** | [models/Enrollment.js](file:///c:/Users/anwes/Desktop/College-portal/models/Enrollment.js) | `studentId` (ref→Student), `courseId` (ref→Course), `status` (enum: enrolled/dropped/completed), `enrolledAt`, `droppedAt` | Junction table linking students to courses; compound unique index on `(studentId, courseId)` |
| **Notices** | [models/Notice.js](file:///c:/Users/anwes/Desktop/College-portal/models/Notice.js) | `title`, `body`, `author` (ref→User), `targetRole` (enum: all/student/faculty), `isPinned`, `createdAt`, `expiresAt` | Campus-wide announcements with role-based targeting and pinning |

---

### 4. MongoDB Update Operations

| Operation | Where | Mongoose method | What it does |
|---|---|---|---|
| **Update user role** | [adminController.js:52](file:///c:/Users/anwes/Desktop/College-portal/controllers/adminController.js#L52) | `User.findByIdAndUpdate(id, { role }, { new: true })` | Admin changes a user's role (student→faculty→admin) via AJAX |
| **Grade a student** | [facultyController.js:87–100](file:///c:/Users/anwes/Desktop/College-portal/controllers/facultyController.js#L87) | `student.grades[idx].grade = grade; student.markModified('grades'); await student.save()` | Faculty assigns/updates a grade in the student's embedded grades array |
| **Update course** | [courseController.js:76–80](file:///c:/Users/anwes/Desktop/College-portal/controllers/courseController.js#L76) | `Course.findByIdAndUpdate(id, { title, code, credits, ... }, { new: true })` | Admin edits course details |
| **Pin/Unpin notice** | [noticeController.js:79–80](file:///c:/Users/anwes/Desktop/College-portal/controllers/noticeController.js#L79) | `notice.isPinned = !notice.isPinned; await notice.save()` | Toggles a notice's pinned status |
| **Drop course** | [courseController.js:146–150](file:///c:/Users/anwes/Desktop/College-portal/controllers/courseController.js#L146) | `Enrollment.findOneAndUpdate({ courseId, studentId, status: 'enrolled' }, { status: 'dropped', droppedAt: new Date() })` | Student drops a course; enrollment status changes to "dropped" |
| **Enroll count** | [courseController.js:130](file:///c:/Users/anwes/Desktop/College-portal/controllers/courseController.js#L130) | `Course.findByIdAndUpdate(id, { $inc: { enrolledCount: 1 } })` | Atomically increments enrolled student count |
| **Grade submission** | [facultyController.js:194–198](file:///c:/Users/anwes/Desktop/College-portal/controllers/facultyController.js#L194) | `submission.marks = marks; submission.status = 'graded'; await submission.save()` | Faculty grades a student's assignment submission |
| **Reset password** | [authController.js:273–275](file:///c:/Users/anwes/Desktop/College-portal/controllers/authController.js#L273) | `user.password = password; await user.save()` | Updates password (pre-save hook re-hashes) |

---

### 5. Cookies / Session

| Detail | Description |
|---|---|
| **Where** | [app.js:24–29](file:///c:/Users/anwes/Desktop/College-portal/app.js#L24) |
| **Package** | `express-session` (in [package.json](file:///c:/Users/anwes/Desktop/College-portal/package.json) line 26) |
| **Configuration** | `session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { secure: false } })` |
| **Session variables** | `req.session.userId` — stores the logged-in user's MongoDB `_id`; `req.session.role` — stores 'student', 'faculty', or 'admin' |
| **Set on login** | [authController.js:161–162](file:///c:/Users/anwes/Desktop/College-portal/controllers/authController.js#L161) — `req.session.userId = user._id; req.session.role = user.role;` |
| **Set on signup** | [authController.js:118–119](file:///c:/Users/anwes/Desktop/College-portal/controllers/authController.js#L118) — same pattern for auto-login after registration |
| **Destroyed on logout** | [authController.js:182–185](file:///c:/Users/anwes/Desktop/College-portal/controllers/authController.js#L182) — `req.session.destroy()` |
| **Protected routes** | [middleware/authMiddleware.js](file:///c:/Users/anwes/Desktop/College-portal/middleware/authMiddleware.js) — checks `req.session.userId` exists, redirects to login if not; [middleware/roleMiddleware.js](file:///c:/Users/anwes/Desktop/College-portal/middleware/roleMiddleware.js) — checks `req.session.role` matches required role(s) |
| **Exposed to views** | [app.js:38](file:///c:/Users/anwes/Desktop/College-portal/app.js#L38) — `res.locals.session = req.session` and `res.locals.user = user` makes session data available in all EJS templates |
| **How it works** | `express-session` creates a server-side session store with a session ID cookie sent to the browser. On each request, middleware reads the session to identify the user. The session stores `userId` and `role`, which are used by auth/role middleware to protect routes and by controllers/views to personalize content. |

---

### 6. Login / Signup

| Detail | Description |
|---|---|
| **Where** | [controllers/authController.js](file:///c:/Users/anwes/Desktop/College-portal/controllers/authController.js) (287 lines) |
| **Login GET** | `getLogin` (line 7) — renders [views/auth/login.ejs](file:///c:/Users/anwes/Desktop/College-portal/views/auth/login.ejs) with Bootstrap card, email/password fields, forgot-password link |
| **Login POST** | `postLogin` (lines 137–177) — validates with `express-validator`, finds user by email, compares password with `user.comparePassword()` (bcrypt), creates session (`req.session.userId` + `req.session.role`), redirects by role |
| **Signup GET** | `getSignup` (line 16) — renders [views/auth/signup.ejs](file:///c:/Users/anwes/Desktop/College-portal/views/auth/signup.ejs) — dynamic form with role-conditional fields (Faculty ID for faculty, department/semester for students) |
| **Signup POST** | `postSignup` (lines 21–133) — validates all fields with `express-validator`; blocks admin self-registration; validates `facultyId` against registry for faculty; checks for duplicate email; creates `User` (password auto-hashed by pre-save hook); creates `Student` profile if student role; auto-logs in after signup |
| **Password hashing** | [models/User.js:38–52](file:///c:/Users/anwes/Desktop/College-portal/models/User.js#L38) — `UserSchema.pre('save')` hook: generates salt with `bcrypt.genSalt(10)`, hashes password with `bcrypt.hash()` |
| **Password comparison** | [models/User.js:56–58](file:///c:/Users/anwes/Desktop/College-portal/models/User.js#L56) — `comparePassword()` instance method uses `bcrypt.compare()` |
| **Forgot/Reset** | `getForgotPassword`, `postForgotPassword` (lines 198–244) — verifies email, generates crypto token, renders reset form; `postResetPassword` (lines 248–287) — validates token expiry, updates password |
| **Routes** | [routes/authRoutes.js](file:///c:/Users/anwes/Desktop/College-portal/routes/authRoutes.js) — `GET/POST /auth/login`, `GET/POST /auth/signup`, `GET /auth/logout`, `GET/POST /auth/forgot-password`, `POST /auth/reset-password` |

---

### 7. Navigation

| Detail | Description |
|---|---|
| **Where** | [views/partials/navbar.ejs](file:///c:/Users/anwes/Desktop/College-portal/views/partials/navbar.ejs) (132 lines) |
| **Bootstrap navbar** | Line 1 — `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">` — responsive, dark-themed navbar |
| **Brand** | Lines 4–6 — `<a class="navbar-brand">` with Bootstrap Icon `bi-mortarboard-fill` and text "EduPortal" |
| **Mobile toggler** | Lines 9–12 — `<button class="navbar-toggler">` with `data-bs-toggle="collapse"` for hamburger menu on small screens |
| **Role-based links** | Uses EJS conditionals to show different navigation links per role: |
| | **All logged-in users** (line 21–23): Notices |
| | **Student** (lines 26–42): Dashboard, Courses, My Grades, Assignments, Profile |
| | **Faculty** (lines 45–52): Dashboard, Courses |
| | **Admin** (lines 55–68): Dashboard, Manage Users, Courses, Reports |
| | **Logged out** (lines 84–98): Login, Sign Up |
| **Dark mode toggle** | Lines 71–76 — in-navbar button with moon/sun icon toggle, uses `localStorage` to persist preference |
| **Active page highlight** | [public/js/main.js:8–15](file:///c:/Users/anwes/Desktop/College-portal/public/js/main.js#L8) — jQuery compares `window.location.pathname` with nav link `href`, adds `.active` class; CSS animated underline effect (style.css:73–88) |
| **Admin sidebar** | [views/admin/partials/sidebar.ejs](file:///c:/Users/anwes/Desktop/College-portal/views/admin/partials/sidebar.ejs) — secondary navigation sidebar for admin pages (Panel, Users, Courses, Notices, Reports, Faculty Registry) |
| **How it works** | The navbar is included on every page via `<%- include('../partials/navbar') %>` in the main layout. EJS conditionals check `locals.user.role` (populated from session in app.js middleware) to conditionally render role-appropriate navigation links. Bootstrap handles responsive collapse behavior. jQuery adds the active-page indicator. |
