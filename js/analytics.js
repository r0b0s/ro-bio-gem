/* =============================================================
   ANALYTICS.JS
   =============================================================

   This file controls analytics.

   It handles:

   - Microsoft Clarity
   - Google Analytics 4
   - Cookie consent
   - Recipient token
   - Page open tracking
   - Section tracking
   - Section duration
   - Scroll tracking

   IMPORTANT:

   You normally only need to change the two values in
   the CONFIGURATION section below.

   ============================================================= */


/* =============================================================
   1. CONFIGURATION
   ============================================================= */

const ANALYTICS_CONFIG = {


    clarityProjectId:
        "y7zppa2xme",



    googleMeasurementId:
        "G-NE96JYZV3K"

};


/*
 * These are the "unedited placeholder" sentinels.
 * They are intentionally different from any real ID format,
 * so a real Clarity ID or GA4 Measurement ID will never
 * accidentally match them and get blocked.
 */

const UNCONFIGURED_CLARITY_ID =
    "y7zppa2xme";

const UNCONFIGURED_GA_ID =
    "G-NE96JYZV3K";


/* =============================================================
   2. RECIPIENT TOKEN
   -------------------------------------------------------------
   
   Later your shared URL can look like:

   https://your-site.netlify.app/?t=ABC123

   This token lets you distinguish different shared links.

   Example:

       Person A -> ABC123
       Person B -> XYZ456

   IMPORTANT:

   Do NOT put someone's name, phone number or email address
   into this token.

   ============================================================= */

const recipientToken =

    new URLSearchParams(
        window.location.search
    ).get("t")

    ||

    "direct_visit";


/* =============================================================
   3. TRACKING VARIABLES
   ============================================================= */

let currentSection =
    null;


let sectionStartTime =
    null;


/* =============================================================
   4. GOOGLE ANALYTICS LOADER
   -------------------------------------------------------------
   Google Analytics is loaded only after consent.
   ============================================================= */

function loadGoogleAnalytics() {


    /*
     * Do not load twice.
     */

    if (
        window.googleAnalyticsLoaded
    ) {

        return;

    }


    /*
     * Stop if you have not entered your ID yet.
     */

    if (

        !ANALYTICS_CONFIG.googleMeasurementId

        ||

        ANALYTICS_CONFIG
            .googleMeasurementId
            ===
            UNCONFIGURED_GA_ID

    ) {

        return;

    }


    /*
     * Prepare dataLayer.
     */

    window.dataLayer =
        window.dataLayer || [];


    /*
     * Create gtag function.
     */

    window.gtag =
        function() {

            window.dataLayer.push(
                arguments
            );

        };


    /*
     * Start GA.
     */

    window.gtag(
        "js",
        new Date()
    );


    window.gtag(
        "config",
        ANALYTICS_CONFIG
            .googleMeasurementId
    );


    /*
     * Create Google Analytics script.
     */

    const script =
        document.createElement(
            "script"
        );


    script.async =
        true;


    script.src =
        "https://www.googletagmanager.com/gtag/js?id="
        +
        encodeURIComponent(
            ANALYTICS_CONFIG
                .googleMeasurementId
        );


    /*
     * Add script to page.
     */

    document.head.appendChild(
        script
    );


    window.googleAnalyticsLoaded =
        true;

}


/* =============================================================
   5. MICROSOFT CLARITY LOADER
   ============================================================= */

function loadClarity() {


    /*
     * Do not load twice.
     */

    if (
        window.clarityLoaded
    ) {

        return;

    }


    /*
     * Stop if Clarity ID hasn't been entered.
     */

    if (

        !ANALYTICS_CONFIG.clarityProjectId

        ||

        ANALYTICS_CONFIG
            .clarityProjectId
            ===
            UNCONFIGURED_CLARITY_ID

    ) {

        return;

    }


    window.clarityLoaded =
        true;


    (function(c,l,a,r,i,t,y){


        c[a] =
            c[a]
            ||
            function() {

                (
                    c[a].q =
                    c[a].q || []
                ).push(arguments);

            };


        t =
            l.createElement(r);


        t.async =
            1;


        t.src =
            "https://www.clarity.ms/tag/"
            +
            i;


        y =
            l.getElementsByTagName(r)[0];


        y.parentNode.insertBefore(
            t,
            y
        );


    })(
        window,
        document,
        "clarity",
        "script",
        ANALYTICS_CONFIG
            .clarityProjectId
    );

}


/* =============================================================
   6. MAIN ANALYTICS FUNCTION
   -------------------------------------------------------------
   
   gallery.js calls this function.

   Example:

       trackEvent(
           "photo_next",
           {
               photo_number: 3
           }
       );

   ============================================================= */

function trackEvent(
    eventName,
    parameters = {}
) {


    /*
     * Add anonymous recipient token to every event.
     */

    parameters.recipient_token =
        recipientToken;


    /* =========================================================
       GOOGLE ANALYTICS
       ========================================================= */

    if (

        typeof window.gtag ===
        "function"

        &&

        localStorage.getItem(
            "cookieConsent"
        )
        ===
        "accepted"

    ) {


        window.gtag(
            "event",
            eventName,
            parameters
        );

    }


    /* =========================================================
       MICROSOFT CLARITY
       ========================================================= */

    if (

        typeof window.clarity ===
        "function"

        &&

        localStorage.getItem(
            "cookieConsent"
        )
        ===
        "accepted"

    ) {


        /*
         * Record event.
         */

        window.clarity(
            "event",
            eventName
        );


        /*
         * Add photo name as a filter.
         */

        if (
            parameters.photo_name
        ) {

            window.clarity(
                "set",
                "photo_name",
                String(
                    parameters.photo_name
                )
            );

        }


        /*
         * Add photo number.
         */

        if (
            parameters.photo_number
        ) {

            window.clarity(
                "set",
                "photo_number",
                String(
                    parameters.photo_number
                )
            );

        }


        /*
         * Add section name.
         */

        if (
            parameters.section_name
        ) {

            window.clarity(
                "set",
                "section_name",
                String(
                    parameters.section_name
                )
            );

        }


        /*
         * Add gallery name.
         */

        if (
            parameters.gallery
        ) {

            window.clarity(
                "set",
                "gallery",
                String(
                    parameters.gallery
                )
            );

        }

    }


    /*
     * Useful for testing while you are developing.
     */

    console.log(
        "Analytics Event:",
        eventName,
        parameters
    );

}


/* =============================================================
   7. COOKIE CONSENT
   ============================================================= */

function initializeConsent() {


    const banner =
        document.getElementById(
            "cookie-banner"
        );


    const acceptButton =
        document.getElementById(
            "acceptCookiesButton"
        );


    const rejectButton =
        document.getElementById(
            "rejectCookiesButton"
        );


    /*
     * Check whether visitor has already made a choice.
     */

    const existingConsent =
        localStorage.getItem(
            "cookieConsent"
        );


    /* =========================================================
       VISITOR ALREADY ACCEPTED
       ========================================================= */

    if (
        existingConsent ===
        "accepted"
    ) {


        banner.style.display =
            "none";


        loadGoogleAnalytics();

        loadClarity();


        /*
         * Tell Clarity that consent was granted.
         */

        setTimeout(
            function() {

                if (
                    typeof window.clarity
                    ===
                    "function"
                ) {

                    window.clarity(
                        "consent",
                        true
                    );

                }

            },
            500
        );


        return;

    }


    /* =========================================================
       VISITOR ALREADY DECLINED
       ========================================================= */

    if (
        existingConsent ===
        "declined"
    ) {


        banner.style.display =
            "none";


        return;

    }


    /* =========================================================
       ACCEPT BUTTON
       ========================================================= */

    acceptButton.addEventListener(
        "click",
        function() {


            localStorage.setItem(
                "cookieConsent",
                "accepted"
            );


            banner.style.display =
                "none";


            /*
             * Load analytics.
             */

            loadGoogleAnalytics();

            loadClarity();


            /*
             * Give Clarity a moment to load.
             */

            setTimeout(
                function() {


                    if (
                        typeof window.clarity
                        ===
                        "function"
                    ) {

                        window.clarity(
                            "consent",
                            true
                        );

                    }


                    trackEvent(
                        "analytics_consent_accepted"
                    );


                },
                500
            );

        }
    );


    /* =========================================================
       DECLINE BUTTON
       ========================================================= */

    rejectButton.addEventListener(
        "click",
        function() {


            localStorage.setItem(
                "cookieConsent",
                "declined"
            );


            banner.style.display =
                "none";

        }
    );

}


/* =============================================================
   8. SECTION TRACKING
   -------------------------------------------------------------
   
   When around 50% of a section becomes visible:

       section_view

   When the visitor moves away:

       section_duration

   ============================================================= */

function initializeSectionTracking() {


    const sections =
        document.querySelectorAll(
            ".tracked-section"
        );


    const observer =
        new IntersectionObserver(

            function(entries) {


                entries.forEach(
                    function(entry) {


                        if (

                            entry.isIntersecting

                            &&

                            entry.intersectionRatio
                                >=
                                0.50

                        ) {


                            const section =
                                entry.target;


                            const sectionId =
                                section.dataset
                                    .sectionId;


                            const sectionTitle =
                                section.dataset
                                    .sectionTitle;


                            /*
                             * Don't restart same section.
                             */

                            if (
                                currentSection
                                ===
                                sectionId
                            ) {

                                return;

                            }


                            /*
                             * Finish previous section.
                             */

                            finishCurrentSection();


                            /*
                             * Start new section.
                             */

                            currentSection =
                                sectionId;


                            sectionStartTime =
                                Date.now();


                            /*
                             * Track section opening.
                             */

                            trackEvent(
                                "section_view",
                                {

                                    section_id:
                                        sectionId,

                                    section_name:
                                        sectionTitle

                                }
                            );

                        }

                    }
                );

            },

            {
                threshold:
                    [0.50]
            }

        );


    /*
     * Start observing every section.
     */

    sections.forEach(
        function(section) {

            observer.observe(
                section
            );

        }
    );

}


/* =============================================================
   9. FINISH SECTION TIMER
   ============================================================= */

function finishCurrentSection() {


    if (
        !currentSection
        ||
        !sectionStartTime
    ) {

        return;

    }


    /*
     * Calculate seconds.
     */

    const duration =
        Math.round(

            (
                Date.now()
                -
                sectionStartTime
            ) / 1000

        );


    /*
     * Find section title.
     */

    const sectionElement =
        document.querySelector(
            '[data-section-id="' +
            currentSection +
            '"]'
        );


    const sectionTitle =
        sectionElement

        ?

        sectionElement.dataset
            .sectionTitle

        :

        currentSection;


    /*
     * Send event.
     */

    trackEvent(
        "section_duration",
        {

            section_id:
                currentSection,

            section_name:
                sectionTitle,

            duration_seconds:
                duration

        }
    );


    /*
     * Reset.
     */

    currentSection =
        null;


    sectionStartTime =
        null;

}


/* =============================================================
   10. SCROLL DEPTH
   ============================================================= */

function initializeScrollTracking() {


    /*
     * These are the milestones we care about.
     */

    const milestones =
        [
            25,
            50,
            75,
            90
        ];


    window.addEventListener(
        "scroll",
        function() {


            const documentHeight =
                document.documentElement
                    .scrollHeight;


            const viewportHeight =
                window.innerHeight;


            const maximumScroll =
                documentHeight
                -
                viewportHeight;


            if (
                maximumScroll <= 0
            ) {

                return;

            }


            /*
             * Calculate percentage scrolled.
             */

            const percentage =
                Math.round(

                    (
                        window.scrollY
                        /
                        maximumScroll
                    )
                    *
                    100

                );


            milestones.forEach(
                function(mark) {


                    if (
                        percentage >=
                        mark
                    ) {


                        const storageKey =
                            "scroll_" +
                            mark;


                        /*
                         * Only record each milestone once
                         * per browser session.
                         */

                        if (
                            !sessionStorage
                                .getItem(
                                    storageKey
                                )
                        ) {


                            sessionStorage.setItem(
                                storageKey,
                                "1"
                            );


                            trackEvent(
                                "scroll_depth",
                                {

                                    percentage:
                                        mark

                                }
                            );

                        }

                    }

                }
            );

        },
        {
            passive:
                true
        }
    );

}


/* =============================================================
   11. PAGE OPEN TRACKING
   ============================================================= */

function initializePageTracking() {


    window.addEventListener(
        "load",
        function() {


            trackEvent(
                "page_open",
                {

                    screen_width:
                        window.innerWidth,

                    screen_height:
                        window.innerHeight

                }
            );

        }
    );

}


/* =============================================================
   12. PAGE LEAVE
   ============================================================= */

window.addEventListener(
    "pagehide",
    function() {


        /*
         * Finish currently viewed biodata section.
         */

        finishCurrentSection();

    }
);


/* =============================================================
   13. START EVERYTHING
   ============================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {


        /*
         * Start cookie consent.
         */

        initializeConsent();


        /*
         * Start section tracking.
         */

        initializeSectionTracking();


        /*
         * Start scroll tracking.
         */

        initializeScrollTracking();


        /*
         * Start page tracking.
         */

        initializePageTracking();

    }
);