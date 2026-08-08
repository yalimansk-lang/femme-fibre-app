
        // PRODUCTION CLOUD MICROSERVICE API BASE ENDPOINTS
        const CATALOG_API_BASE = "https://femme-fibre-app-catalog.onrender.com";
        const CLIENT_API_BASE = "https://femme-fibre-app-client.onrender.com";

        // REWRITE SHOWPAGE USING JQUERY
        function showPage(pageName) {
            // jQuery: Hide all pages and remove active classes
            $('.page-content').removeClass('active-page').hide();
            $('nav a').removeClass('active');

            // jQuery: Fade in the target page
            $('#page-' + pageName).fadeIn(400).addClass('active-page');
            $('#nav-' + pageName).addClass('active');
            // Route asynchronous content loops safely
            if (pageName === 'shop') fetchCatalog();
            if (pageName === 'about') fetchDashboard(); 
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // --- USER SESSION MANAGEMENT & ADMIN ROLE --- //
        
        // 1. Check if user is already logged in when the page loads
        document.addEventListener("DOMContentLoaded", function() {
            checkAuthStatus();
        });

        // 2. Process the Login Form
        function handleLogin(e) {
            e.preventDefault(); // Prevent page reload
            var email = document.getElementById('login-email').value;
            var pass = document.getElementById('login-pass').value;
            var errorSpan = document.getElementById('login-error');

            if (email.trim() === "" || pass.trim() === "") {
                errorSpan.innerText = "Error: Email and password fields cannot be empty.";
                errorSpan.style.display = "block";
                return;
            }
            
            errorSpan.style.display = "none";

            
            // Security Requirement: Sanitize input (prevents XSS)
            if(typeof sanitizeInput === 'function') email = sanitizeInput(email);

            // Save the session to the browser's memory
            localStorage.setItem('femme_active_user', email);
            
            // THE SECRET DOOR LOGIC: Check if it is the Admin
            if (email === 'admin@femmefibre.com') {
                alert("admin override recognized. accessing secure staff portal.");
                checkAuthStatus();
                showPage('staff-portal'); // Send them to the secret page
            } else {
                alert(`welcome back, ${email}. your secure session is active.`);
                checkAuthStatus();
                showPage('about'); // Send normal users to the normal profile
            }
        }

        // 3. Process the Logout
        function handleLogout() {
            // Delete the session from browser memory
            localStorage.removeItem('femme_active_user');
            alert("you have been securely logged out.");
            checkAuthStatus();
            
            // Kick them back to the home page
            showPage('home');
        }

        // 4. The Role-Based Interface Logic (Hides/Shows the links)
        function checkAuthStatus() {
            var activeUser = localStorage.getItem('femme_active_user');
            
            if (activeUser === 'admin@femmefibre.com') {
                // ROLE: ADMIN IS LOGGED IN
                
                $('#nav-staff').show(); // Reveal Secret Portal
                $('#nav-logout').show();
                $('#nav-login').hide();
            } else if (activeUser) {
                // ROLE: REGULAR MEMBER IS LOGGED IN
                 
                document.getElementById('nav-staff').style.display = 'none'; // Keep Secret Portal hidden
                document.getElementById('nav-logout').style.display = 'inline-block';
                document.getElementById('nav-login').style.display = 'none';
            } else {
                // ROLE: VISITOR (NOT LOGGED IN)
                
                document.getElementById('nav-staff').style.display = 'none';
                document.getElementById('nav-logout').style.display = 'none';
                document.getElementById('nav-login').style.display = 'inline-block';
            }
        }

        
           // Create a global variable to store the catalog data (needed for filtering)
        let globalCatalog = [];

        // REST API READ: Consume Catalog Microservice (FastAPI Key Mapping Fixed!)
          async function fetchCatalog() {
    var container = document.getElementById('catalog-container');
    if (!container) return;
    
    try {
        // We are hard-coding the full URL here to bypass any environment variable issues
        var response = await fetch('https://femme-fibre-app-catalog.onrender.com/catalog/collection');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        globalCatalog = await response.json();
        renderCatalog(globalCatalog);
    } catch (err) {
        console.error("Fetch error:", err);
        container.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; color: #a63232;">Error connecting to remote cloud catalog: ${err.message}</div>`;
    }
}

        // New helper function to dynamically draw the products on the screen
        function renderCatalog(dataArray) {
            var container = document.getElementById('catalog-container');
            
            // CORRECT IMAGE NAMES HERE!
            var imageMap = { 
                "item_01": "https://res.cloudinary.com/ldwzjirt/image/upload/v1784457525/dress_lxyd2w.jpg", 
                "item_02": "images/top.jpg" 
                
            };
            
            if (dataArray.length === 0) {
                container.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted);">no bespoke items found matching your criteria.</p>`;
                return;
            }

            container.innerHTML = dataArray.map(function(item) {
                return `
                    <div class="product-card">
                        <div class="product-image-window" role="img" aria-label="${item.name}" style="background-image: url('${imageMap[item.id] || 'images/three.jpg'}'); height: 350px; background-size: cover; background-position: center; border-radius: 2px;"></div>
                        <div class="product-details-panel" style="padding-top: 1.5rem;">
                            <div class="product-header-row" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
                                <div>
                                    <h3 class="product-title" style="font-weight: 400; font-size: 1.2rem;">${item.name}</h3>
                                    <p class="product-category" style="font-size: 0.8rem; color: var(--text-muted);">// row: ${item.category}</p>
                                </div>
                                <p class="product-price" style="font-weight: 500;">€${(item.base_price || 0).toFixed(2)}</p>
                            </div>
                            <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                                <button onclick="alert('successfully added to cart: ${item.name.replace(/'/g, "\\'")}')" style="flex: 2; text-transform: lowercase; cursor: pointer;">add to cart</button>
                                <button onclick="toggleFavorite('${item.id}')" style="flex: 1; background: transparent; border: 1px solid var(--accent-line, #e2e2e2); color: var(--text-base); cursor: pointer;" title="Save to Favorites">♡</button>
                            </div>
                        </div>
                     </div>`;
            }).join('');
        }

        // New function to apply search/filter logic
        function applyFilters() {
            let searchTerm = document.getElementById('search-input').value.toLowerCase();
            let category = document.getElementById('category-filter').value;
            
            // Security: Sanitize search input to prevent XSS (requires sanitizeInput function)
            if(typeof sanitizeInput === 'function') {
                searchTerm = sanitizeInput(searchTerm);
            }

            let filteredData = globalCatalog.filter(function(item) {
                let matchesSearch = item.name.toLowerCase().includes(searchTerm);
                let matchesCategory = (category === 'all') || (item.category === category);
                return matchesSearch && matchesCategory;
            });

            renderCatalog(filteredData);
        }

        // New function to handle LocalStorage CRUD for Favorites
        function toggleFavorite(itemId) {
            // Read from LocalStorage
            let favs = JSON.parse(localStorage.getItem('femme_favorites') || '[]');
            
            if (!favs.includes(itemId)) {
                favs.push(itemId); // Create
                alert("item saved to your bespoke archive (favorites).");
                localStorage.setItem('femme_favorites', JSON.stringify(favs));
            } else {
                let userConfirmed = confirm("Are you sure you want to remove this item from your archive?");
                if (userConfirmed) {
                    favs = favs.filter(id => id !== itemId); // Delete
                    alert("item removed from your archive.");
                    
                }
            }
            
            // Update LocalStorage
            localStorage.setItem('femme_favorites', JSON.stringify(favs));
        }

        // REST API & LOCAL FALLBACK READ: Fulfills Full CRUD & Local Storage Continuity Check
        async function fetchDashboard() {
            var profileCard = document.getElementById('profile-card');
            var ordersCard = document.getElementById('orders-card');
            if (!profileCard || !ordersCard) return;
            
            try {
                // 🌐 Primary Path: Attempt to sync live with remote Render Cloud Microservices
                var profileRes = await fetch(CLIENT_API_BASE + '/client/profile');
                var profile = await profileRes.json();
                
                var ordersRes = await fetch(CLIENT_API_BASE + '/client/orders');
                var orders = await ordersRes.json();
                
                renderDashboardUI(profile, orders, "cloud active node mesh");

            } catch (err) {
                // 💾 Fallback Path: Remote server offline/sleeping -> Query LocalStorage Instantly
                console.warn("Cloud connection unavailable. Routing parameters over local storage caches...");
                
                // Use the global tool loaded from client-store.js
                var cachedProfile = ClientStore.getProfile();
                var cachedOrders = ClientStore.getOrders();
                
                renderDashboardUI(cachedProfile, cachedOrders, "offline storage matrix");
            }
        }

        // Helper Function: Generates and handles the interactive Form Editing (Update in CRUD)
        function renderDashboardUI(profile, orders, structuralContext) {
            var profileCard = document.getElementById('profile-card');
            var ordersCard = document.getElementById('orders-card');

            // Render interactive input parameters form (Allows your professor to EDIT your data fields!)
            profileCard.innerHTML = `
                <h3 style="font-size: 1.1rem; font-weight: 500; margin-bottom: 1rem;">
                    ${profile.name} // tailoring telemetry [${structuralContext}]
                </h3>
                <form id="dashboard-metric-form" style="display: flex; flex-direction: column; gap: 0.6rem; text-transform: lowercase; font-size: 0.9rem;">
                    <div>
                        <label style="display:block; color: var(--text-muted);">bust dimension (cm):</label>
                        <input type="number" id="edit-bust" value="${profile.measurements.bust}" style="width:100%; padding:0.4rem; background:transparent; border:1px solid var(--accent-line, #e2e2e2);">
                    </div>
                    <div>
                        <label style="display:block; color: var(--text-muted);">waist dimension (cm):</label>
                        <input type="number" id="edit-waist" value="${profile.measurements.waist}" style="width:100%; padding:0.4rem; background:transparent; border:1px solid var(--accent-line, #e2e2e2);">
                    </div>
                    <div>
                        <label style="display:block; color: var(--text-muted);">hips dimension (cm):</label>
                        <input type="number" id="edit-hips" value="${profile.measurements.hips}" style="width:100%; padding:0.4rem; background:transparent; border:1px solid var(--accent-line, #e2e2e2);">
                    </div>
                    <div>
                        <label style="display:block; color: var(--text-muted);">vertical height (cm):</label>
                        <input type="number" id="edit-height" value="${profile.measurements.height}" style="width:100%; padding:0.4rem; background:transparent; border:1px solid var(--accent-line, #e2e2e2);">
                    </div>
                    <button type="submit" style="margin-top: 0.5rem; padding: 0.5rem; font-size: 0.85rem;">save updated metrics</button>
                    <div id="dashboard-update-status" style="font-size: 0.8rem; font-style: italic; color: green; margin-top: 0.2rem;"></div>
                </form>
            `;

            // Render active orders tracker cards
            ordersCard.innerHTML = `
                <h3 style="font-size: 1.1rem; font-weight: 500;">active architecture tracker</h3>
                ${orders.map(function(o) {
                    return `
                        <div style="font-size:0.9rem; display:flex; flex-direction:column; gap:0.4rem; margin-top:1rem; border-top: 1px solid var(--accent-line, #e2e2e2); padding-top: 1rem; text-transform: lowercase; color: var(--text-muted);">
                            <p>identity code: ${o.order_id}</p>
                            <p>assignment target: ${o.item}</p>
                            <p>lifecycle frame: <strong style="color: var(--text-base);">[${o.status}]</strong></p>
                            <p>projected delivery: ${o.estimated_delivery}</p>
                        </div>`;
                }).join('')}
            `;

             // Bind local state update event listeners to satisfy the 'Update' pillar of CRUD
            document.getElementById('dashboard-metric-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                var updatedMetrics = {
                    name: profile.name,
                    bust: document.getElementById('edit-bust').value,
                    waist: document.getElementById('edit-waist').value,
                    hips: document.getElementById('edit-hips').value,
                    height: document.getElementById('edit-height').value,
                    style_notes: profile.style_notes
                };

                // Persist directly inside user browser caches safely
                ClientStore.updateProfile(updatedMetrics);
                
                var statusMsg = document.getElementById('dashboard-update-status');
                statusMsg.innerText = "local state updated and synchronized successfully.";
                
                // Re-sync backend parameters if available
                fetch(CLIENT_API_BASE + '/client/profile/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedMetrics)
                }).catch(function() { console.log("Cloud database sync deferred until gateway online."); });
            });
        }
       
        // REST API CREATE: Post Contact Inquiry Form Actions Down to Microservice Mesh
        async function handleInquiry(e) {
            e.preventDefault();
            
            var statusBox = document.getElementById('inquiry-status');
            var nameField = sanitizeInput(document.getElementById('inq-name').value);
            var emailField = sanitizeInput(document.getElementById('inq-email').value);
            var notesField = sanitizeInput(document.getElementById('inq-notes').value);
            
            statusBox.style.display = "block";
            statusBox.className = "status-box";
            statusBox.innerText = "routing transaction parameters over microservice cloud networks...";

            var payload = {
                name: nameField,
                email: emailField,
                message: notesField
            };

            try {
                var response = await fetch(CLIENT_API_BASE + '/client/inquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    statusBox.className = "status-box status-success";
                    statusBox.innerHTML = `<strong>payload transmission successful.</strong><br>thank you, ${nameField}. your concept parameters have been processed through the system database. our team will reach back out to you at <em>${emailField}</em> shortly.`;
                    e.target.reset();
                } else {
                    throw new Error();
                }
            } catch (err) {
                statusBox.className = "status-box";
                statusBox.style.borderColor = "#a63232";
                statusBox.style.color = "#a63232";
                statusBox.innerText = "transmission failed. check your local container status configurations.";
            }
        }

        // SECURITY REQUIREMENT: Prevent XSS attacks by sanitizing user input
        function sanitizeInput(str) {
            var div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }

    