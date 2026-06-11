STEM Resources Discovery Platform - India
1. Executive Summary
1.1 Product Vision
Create a comprehensive, community-driven platform that connects students, educators, innovators, and professionals with STEM resources across India, including Makerspaces, ATAL Tinkering Labs, and STEM vendors through an intuitive, map-based discovery experience.
1.2 Objectives
Centralize STEM resource information across India
Enable easy discovery through geographic and categorical filtering
Facilitate community engagement and resource sharing
Maintain data accuracy through crowdsourced verification
Support resource providers with dedicated profile pages

2. Target Audience
2.1 Primary Users
Students & Educators: Seeking nearby STEM facilities for projects and learning
Innovators & Makers: Looking for fabrication facilities and equipment access
Researchers: Finding collaboration opportunities and specialized equipment
Parents: Discovering STEM learning opportunities for children
2.2 Secondary Users
Lab Administrators: Managing their facility listings
STEM Vendors: Showcasing products and services
Government Officials: Monitoring STEM infrastructure deployment
Platform Administrators: Maintaining data quality and platform integrity

3. Core Features & Functionality
3.1 Resource Discovery
3.1.1 Interactive Map View
Requirements:
Full-screen interactive map of India using mapping service (Google Maps/Mapbox/Leaflet)
Custom markers for different resource types:
Makerspaces (custom icon)
ATAL Tinkering Labs (custom icon)
STEM Vendors (custom icon)
Marker clustering for dense areas with count indicators
Marker color-coding by operational status:
Green: Working
Yellow: Planned
Orange: Temporarily Closed
Red: Permanently Closed
Click on marker to show preview card with:
Resource name
Type
Location (city/district)
Status
"View Details" button
Map controls: zoom, pan, reset view, locate me
Responsive design for mobile and desktop
3.1.2 List View
Requirements:
Grid/list toggle view option
Card-based layout showing:
Resource name and type
Thumbnail image
Location (State, District, City)
Status badge
Brief description (truncated)
"View Details" button
Pagination (20-50 items per page) or infinite scroll
Sort options:
Alphabetical (A-Z, Z-A)
Recently added
Distance (when location enabled)
Status
3.1.3 Advanced Filtering System
Requirements:
Geographic Filters:
State dropdown (all 28 states + 8 UTs)
District dropdown (dynamic based on state selection)
City/Area text search
Proximity search (radius-based when location enabled)
Resource Type Filters:
Multi-select checkbox:
Makerspace
ATAL Tinkering Lab
STEM Vendor
Status Filters:
Multi-select checkbox:
Working
Planned
Temporarily Closed
Permanently Closed
Facilities & Equipment Filters:
Multi-select categories:
3D Printing
Laser Cutting
CNC Machines
Electronics Lab
Robotics
Wood Workshop
Metal Workshop
PCB Fabrication
VR/AR Equipment
Computer Lab
Testing Equipment
Other (custom tags)
Additional Filters:
Open to public (Yes/No)
Membership required (Yes/No)
Verified listing (badge)
Filter Behavior:
Real-time updates (or "Apply Filters" button for performance)
Clear all filters option
Show result count
Save filter preferences (logged-in users)
Filters persist across map/list view switches
3.2 Individual Resource Page
3.2.1 Core Information Section
Requirements:
Resource name (H1 heading)
Resource type badge
Operational status badge with color coding
Star rating and review count (future enhancement)
Hero image/banner
Short bio/description (300-500 characters)
Full description (rich text editor support)
3.2.2 Contact & Location Section
Requirements:
Address: Full postal address with copy button
Google Maps Embed: Interactive map showing location with "Get Directions" link
Contact Number: Clickable phone number(s)
Email: Clickable email with copy button
Website: Clickable external link with icon
Social Media Links: Clickable icons for:
Facebook
Instagram
Twitter/X
LinkedIn
YouTube
Custom links (other platforms)
3.2.3 Photo Gallery
Requirements:
Lightbox-enabled photo gallery
Multiple photo upload support (minimum 5, maximum 20)
Caption support for each photo
Thumbnail grid view
Image optimization for web performance
Upload specifications: Max 5MB per image, JPG/PNG formats
3.2.4 Machines & Facilities Section
Requirements:
Structured list of available equipment/machines
Each item includes:
Machine/Equipment name
Category/Type
Model/Specifications (optional)
Availability status (Available/Under Maintenance/Booked)
Quantity
Access conditions (members only, paid, free, booking required)
Visual icons for equipment categories
Add/Edit/Delete functionality for verified admins
3.2.5 Operating Hours & Access Information
Requirements:
Weekly schedule display
Special hours (holidays, events)
Access type: Public/Members Only/By Appointment
Membership information (if applicable)
Pricing information (if applicable)
3.2.6 Action Buttons Section
Requirements:
Claim This Lab/Resource:
Prominent button with shield/badge icon
Opens claim request form modal:
Claimer name
Email
Phone number
Role (Owner/Administrator/Staff)
Proof of association (file upload)
Message to admin
Captcha verification
Sends notification to platform admin
Shows "Claim Pending" badge if already claimed
Report an Issue:
Flag icon button
Opens report form modal:
Reporter name (optional for logged-in users)
Email
Issue type dropdown:
Incorrect information
Permanently closed
Duplicate listing
Inappropriate content
Other
Detailed description (required)
Screenshot upload (optional)
Captcha verification
Sends notification to admin
Thank you confirmation message
Share:
Social media share buttons (WhatsApp, Facebook, Twitter, LinkedIn)
Copy link button
QR code generator for physical sharing
Bookmark/Save:
Save to favorites (requires login)
Add to custom collections
3.3 Status Management System
3.3.1 Status Types
Requirements:
Planned: Lab is in planning/construction phase
Shows estimated opening date field
Gray/blue indicator
Working: Lab is operational
Shows operational since date
Green indicator
Default status
Temporarily Closed: Lab is closed for short term
Shows closure reason (optional)
Shows expected reopening date (optional)
Orange indicator
Permanently Closed: Lab has shut down
Shows closure date
Shows closure reason (optional)
Red indicator
Archived from main search (optional filter to show)
3.3.2 Status Update Mechanism
Requirements:
Only verified admins/owners can update status
Status change triggers:
Email notification to platform admin
Update timestamp
Status history log
Community members can suggest status changes via report function
Automatic status review reminder (quarterly) for verified owners
3.4 Data Management
3.4.1 Resource Submission
Requirements:
Public submission form for new resources
Required fields:
Resource name*
Type* (Makerspace/ATAL Lab/Vendor)
State*
District*
Full address*
Contact email or phone*
Short description*
Optional fields:
Website
Social media links
Photos (up to 5 during submission)
Operating hours
Facilities list
Google Maps location (pin drop)
Moderation queue for admin approval
Auto-email to submitter on approval/rejection
3.4.2 Admin Dashboard
Requirements:
Resource Management:
View all resources with advanced filters
Approve/reject pending submissions
Edit any resource information
Delete/Archive resources
Bulk actions support
Export data (CSV/Excel)
Claim Management:
View all claim requests
Approve/reject claims
Contact claimer for verification
Transfer admin rights on approval
Report Management:
View all reports with priority flags
Assign reports to team members
Mark as resolved/invalid
Contact reporter for clarification
User Management:
View registered users
Manage user roles (Admin, Verified Owner, User)
Ban/suspend users
Analytics Dashboard:
Total resources by type
Geographic distribution
Status distribution
Popular searches
User engagement metrics
Growth over time charts

4. Technical Requirements
4.1 Frontend
Framework: React.js or Next.js (for SEO benefits)
UI Library: Tailwind CSS or Material-UI
Map Integration: Google Maps API, Mapbox, or Leaflet.js
State Management: Redux or Context API
Form Handling: React Hook Form with validation
4.2 Backend
Framework: Node.js (Express) or Python (Django/FastAPI)
Database: PostgreSQL with PostGIS extension for geospatial queries
API: RESTful or GraphQL
Authentication: JWT tokens, OAuth for social login
File Storage: AWS S3, Cloudinary, or similar for images
4.3 Hosting & Infrastructure
Frontend Hosting: Vercel, Netlify, or AWS Amplify
Backend Hosting: AWS, Google Cloud, or DigitalOcean
CDN: CloudFront or Cloudflare for static assets
Database: Managed PostgreSQL (AWS RDS, Google Cloud SQL)
4.4 Security
HTTPS encryption
Input sanitization
SQL injection prevention
CAPTCHA for public forms
Rate limiting for API endpoints
GDPR compliance for data handling
4.5 Performance
Lazy loading for images
Map marker clustering
Database indexing on frequently queried fields
Caching strategy (Redis) for common queries
CDN for static assets
Mobile-first responsive design

5. User Roles & Permissions
5.1 Role Matrix
Feature
Public User
Registered User
Verified Owner
Platform Admin
View resources
✓
✓
✓
✓
Use filters/map
✓
✓
✓
✓
Submit new resource
✓
✓
✓
✓
Report issues
✓
✓
✓
✓
Claim resource
✓
✓
✓
-
Save favorites
-
✓
✓
✓
Edit own resource
-
-
✓
✓
Update status
-
-
✓
✓
Manage photos
-
-
✓
✓
Approve submissions
-
-
-
✓
Manage claims
-
-
-
✓
Access analytics
-
-
Limited
✓


6. User Flows
6.1 Discovery Flow
User lands on homepage with map/list view
User applies geographic filters (State → District)
User selects resource type and status filters
Results update in real-time
User clicks on marker/card to view preview
User clicks "View Details" to access full resource page
6.2 Claim Flow
User discovers their lab on platform
User clicks "Claim This Lab" button
User fills out claim form with verification details
User submits claim request
Admin receives notification
Admin reviews proof and approves/rejects
User receives email notification
Approved: User gains verified owner access
6.3 Report Flow
User finds incorrect/outdated information
User clicks "Report an Issue" button
User selects issue type and provides details
User submits report
Admin receives notification in dashboard
Admin investigates and takes action
User receives confirmation email

7. Data Schema 
7.1 Resource Entity
- id (primary key)
- name
- type (enum: Makerspace, ATAL Lab, Vendor)
- status (enum: Planned, Working, Temporarily Closed, Permanently Closed)
- short_description
- full_description
- address_line1
- address_line2
- city
- district
- state
- pincode
- latitude
- longitude
- contact_phone
- contact_email
- website
- social_media (JSON: {facebook, instagram, twitter, linkedin, youtube})
- operating_hours (JSON)
- is_verified
- is_public
- created_at
- updated_at
- created_by (user_id)
- verified_owner (user_id, nullable)
7.2 Machine/Facility Entity
- id (primary key)
- resource_id (foreign key)
- name
- category
- model_specs
- quantity
- availability_status
- access_conditions
- created_at
- updated_at
7.3 Photo Entity
- id (primary key)
- resource_id (foreign key)
- image_url
- caption
- uploaded_by (user_id)
- created_at
7.4 Claim Request Entity
- id (primary key)
- resource_id (foreign key)
- claimer_name
- claimer_email
- claimer_phone
- role
- proof_document_url
- message
- status (enum: Pending, Approved, Rejected)
- created_at
- reviewed_at
- reviewed_by (admin_id)
7.5 Report Entity
- id (primary key)
- resource_id (foreign key)
- reporter_name
- reporter_email
- issue_type
- description
- screenshot_url
- status (enum: Open, In Progress, Resolved, Invalid)
- created_at
- resolved_at
- resolved_by (admin_id)

8. MVP vs Future Enhancements
8.1 MVP (Phase 1)
Interactive map with basic markers
State and district filtering
Resource type filtering
Individual resource pages with core information
Photo gallery (5 photos max)
Contact information display
Basic machines/facilities list
Claim and report functionality
Status management (4 states)
Admin dashboard for moderation
Public resource submission
8.2 Future Enhancements (Phase 2+)
User authentication and profiles
Save favorites and collections
Rating and review system
Advanced search with full-text search
Event listings for workshops/programs
Booking system for equipment
Messaging between users and lab owners
Mobile app (iOS/Android)
Multi-language support (Hindi, regional languages)
API for third-party integrations
Machine learning for duplicate detection
Community forums/discussions
Newsletter and notification system
Analytics for lab owners
Verified badges and certification system
Sponsored listings for vendors
Resource comparison tool

9. Success Metrics (KPIs)
9.1 Platform Adoption
Total resources listed (target: 500+ in 6 months)
Geographic coverage (% of districts covered)
Resource type distribution
Verified resources percentage
9.2 User Engagement
Monthly active users
Average session duration
Pages per session
Return visitor rate
Map interactions
Filter usage patterns
9.3 Data Quality
Claim rate (% of resources claimed)
Average time to claim approval
Report resolution rate
Data accuracy score (based on audits)
9.4 Growth
New resource submissions per month
User growth rate
Social shares
Referral traffic sources

11. Risks & Mitigation
11.1 Data Quality Risk
Risk: Inaccurate or outdated information
Mitigation: Mandatory moderation, community reporting, periodic verification
11.2 Spam/Abuse Risk
Risk: Spam submissions or fraudulent claims
Mitigation: CAPTCHA, manual moderation, user reputation system
11.3 Scalability Risk
Risk: Performance issues with large dataset
Mitigation: Database optimization, caching, CDN, marker clustering
11.4 Adoption Risk
Risk: Low initial data/user adoption
Mitigation: Partnership with ATAL Innovation Mission, outreach to existing labs, initial data seeding


13. Appendix
13.1 Design References
Airbnb (for map and listing UI)
Yelp (for business profiles)
Google Maps (for location features)
Product Hunt (for clean card layouts)

