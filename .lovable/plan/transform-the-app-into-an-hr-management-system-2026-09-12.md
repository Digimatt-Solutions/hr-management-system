# Transform the app into an HR Management System

The current app is an auto-parts inventory and point-of-sale system. It already has the pieces an HR system needs: sign-in, a role system, a sidebar shell, department-style multi-location scoping, and working client-side routing. The plan keeps all of that and rebuilds the features, data, and workflows around people management.

## What is kept

- Sign-in / sign-up, session handling, protected and public route behaviour
- The routing setup exactly as it is (single-page app, same router), so direct links, refreshes, redirects and nested pages keep working
- The sidebar + top bar shell, all UI building blocks, styling foundation
- The role model (three levels) and the "which locations can this person see" scoping pattern, re-aimed at departments
- The user profile record created automatically on sign-up

## What is replaced

- Inventory, Products, Categories, Point of Sale, Suppliers, Stock Alerts pages and their tables
- Shop switcher becomes a department switcher
- Product/supplier dialogs become employee/leave dialogs

## What is refactored

- Dashboard becomes an HR overview: headcount, people on leave today, pending approvals, upcoming reviews, new hires
- Profile page becomes "My profile" with employment details, manager, department, and leave balance
- Roles become HR Admin, Manager, Employee

## New structure

Pages and routes:

- `/dashboard` — HR overview
- `/employees` and `/employees/:id` — directory and full employee record (nested tabs: details, employment, leave, attendance, documents, reviews)
- `/departments` — departments and positions
- `/leave` — my requests, team requests, approvals
- `/attendance` — daily clock in/out log and timesheets
- `/payroll` — pay periods and per-employee payslip lines
- `/performance` — review cycles and reviews
- `/announcements` — company notices
- `/onboarding` — checklists for new hires
- `/profile` — my profile
- `/settings` — leave types, holidays, role and department access management (HR Admin only)
- `/auth`, plus catch-all not-found

Access rules by role:

- Employee: own record, own leave/attendance/payslips, directory (limited fields), announcements
- Manager: everything an employee sees, plus their department's people, leave approvals, attendance, reviews
- HR Admin: everything, plus payroll, settings, roles and department access

## Data model

New tables: `departments`, `positions`, `employees`, `employment_history`, `leave_types`, `leave_balances`, `leave_requests`, `attendance_records`, `holidays`, `payroll_periods`, `payslips`, `review_cycles`, `performance_reviews`, `review_goals`, `announcements`, `onboarding_tasks`, `employee_documents`.

Reused and renamed: `profiles` stays; `user_roles` keeps its shape with HR role values; shop access becomes department access.

Removed: shops, products, categories, suppliers, inventory, sales, sale items, reorder requests, stock alerts.

## Workflows

- Leave request: employee submits, balance checked, manager approves or declines, balance deducted, requester notified
- Attendance: clock in / clock out, late and overtime flags, monthly timesheet per employee
- Onboarding: HR Admin creates an employee, a checklist is generated, tasks are ticked off
- Performance: HR Admin opens a cycle, managers submit reviews with ratings and goals, employee sees their own
- Payroll: HR Admin opens a period, payslip lines generated from salary plus attendance, period locked when finalised

## Technical notes

- Routing stays on the existing `BrowserRouter` with the same protected/public wrappers. Employee detail tabs use nested routes with an outlet so refreshing a tab URL lands on that tab.
- A role guard wrapper is added next to the existing protected-route wrapper so restricted pages redirect instead of failing silently.
- Database changes go in ordered migrations: create HR schema with row-level security and grants, seed reference data (leave types, sample departments and positions), then drop the retail tables once no page reads them.
- Approval, balance deduction and payroll generation run as database functions/triggers so rules can't be bypassed from the browser.
- Sample data is seeded so every page has something to show.

## Build order

1. HR database schema, roles, access rules, seeded reference data
2. Routing, role guard, sidebar, layout, department switcher
3. Employees directory and employee record with nested tabs
4. Leave (requests + approvals) and attendance
5. Dashboard, profile, announcements, onboarding
6. Performance and payroll
7. Settings, then remove the retail tables and dead code
