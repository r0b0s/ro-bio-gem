/* =============================================================
   GALLERY.JS
   =============================================================

   This file controls ONLY the photo gallery.

   If you want to change:

   - Add/remove photos
   - Photo names
   - View Photos button
   - Popup behavior
   - Previous/Next buttons
   - Swipe behavior
   - Thumbnail behavior
   - Photo timing

   edit this file.

   ============================================================= */


/* =============================================================
   1. YOUR PHOTOS

   THIS IS THE MAIN SECTION YOU WILL EDIT.

   Add/remove photos here.

   The photo filename must exactly match the file in your
   website folder.

   Example:

       photo1.jpeg

   means there must be:

       photo1.jpeg

   in the same folder as index.html.

   ============================================================= */

const PHOTOS = [

    {
        src: "img/photo1.jpeg",
        title: "Profile Photo"
    },

    {
        src: "img/photo2.jpeg",
        title: "Professional Photo"
    },

    {
        src: "img/photo3.jpeg",
        title: "Outdoor Photo"
    },

    {
        src: "img/photo4.jpeg",
        title: "Professional Photo"
    },

    {
        src: "img/photo5.jpeg",
        title: "Casual Photo"
    },

    {
        src: "img/photo6.jpeg",
        title: "Professional Photo"
    },

    {
        src: "img/photo7.jpeg",
        title: "Outdoor Photo"
    },

    {
        src: "img/photo8.jpeg",
        title: "Casual Photo"
    },

    {
        src: "img/photo9.jpeg",
        title: "Additional Photo"
    }

];


/* =============================================================
   2. GALLERY VARIABLES
   ============================================================= */

let currentPhotoIndex =
    0;

let galleryIsOpen =
    false;


/*
 * Used to calculate approximately how long
 * the visitor viewed each photo.
 */
let photoViewStartTime =
    null;


/*
 * Used to calculate total time spent
 * inside the popup.
 */
let galleryOpenTime =
    null;


/* =============================================================
   3. SWIPE / DRAG VARIABLES
   ============================================================= */

let pointerStartX =
    null;

let pointerStartY =
    null;

let pointerCurrentX =
    null;

let isDragging =
    false;


/*
 * Minimum distance required before
 * a swipe changes the photo.
 */
const SWIPE_DISTANCE =
    55;


/* =============================================================
   4. HTML ELEMENT VARIABLES
   ============================================================= */

let viewGalleryButton;

let galleryModal;

let closeGalleryButton;

let previousPhotoButton;

let nextPhotoButton;

let popupMainPhoto;

let popupPhotoCounter;

let popupPhotoCaption;

let popupThumbnails;

let photoStage;


/* =============================================================
   5. START GALLERY
   ============================================================= */

function initializeGallery() {


    /*
     * Find the HTML elements.
     */

    viewGalleryButton =
        document.getElementById(
            "viewGalleryButton"
        );


    galleryModal =
        document.getElementById(
            "photoGalleryModal"
        );


    closeGalleryButton =
        document.getElementById(
            "closeGalleryButton"
        );


    previousPhotoButton =
        document.getElementById(
            "previousPhotoButton"
        );


    nextPhotoButton =
        document.getElementById(
            "nextPhotoButton"
        );


    popupMainPhoto =
        document.getElementById(
            "popupMainPhoto"
        );


    popupPhotoCounter =
        document.getElementById(
            "popupPhotoCounter"
        );


    popupPhotoCaption =
        document.getElementById(
            "popupPhotoCaption"
        );


    popupThumbnails =
        document.getElementById(
            "popupThumbnails"
        );


    photoStage =
        document.getElementById(
            "photoStage"
        );


    /*
     * Create thumbnails.
     */

    buildThumbnails();


    /*
     * View Photos button.
     */

    viewGalleryButton.addEventListener(
        "click",
        openGallery
    );


    /*
     * Close button.
     */

    closeGalleryButton.addEventListener(
        "click",
        closeGallery
    );


    /*
     * Previous button.
     */

    previousPhotoButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            previousPhoto();

        }
    );


    /*
     * Next button.
     */

    nextPhotoButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            nextPhoto();

        }
    );


    /*
     * Clicking the dark area outside the gallery
     * closes the popup.
     */

    galleryModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                galleryModal
            ) {

                closeGallery();

            }

        }
    );


    /*
     * Enable swipe/drag.
     */

    initializeSwipeTracking();


    /*
     * Enable keyboard navigation.
     */

    initializeKeyboardControls();

}


/* =============================================================
   6. CREATE THUMBNAILS
   ============================================================= */

function buildThumbnails() {


    popupThumbnails.innerHTML =
        "";


    PHOTOS.forEach(
        function(photo, index) {


            /*
             * Create an image element.
             */

            const thumbnail =
                document.createElement(
                    "img"
                );


            /*
             * Use the same image file.
             */

            thumbnail.src =
                photo.src;


            /*
             * Accessibility.
             */

            thumbnail.alt =
                photo.title;


            /*
             * CSS class.
             */

            thumbnail.className =
                "popup-thumbnail";


            /*
             * Clicking thumbnail opens that photo.
             */

            thumbnail.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    showPhoto(
                        index,
                        "thumbnail"
                    );

                }
            );


            popupThumbnails.appendChild(
                thumbnail
            );

        }
    );

}


/* =============================================================
   7. OPEN PHOTO POPUP
   ============================================================= */

function openGallery() {


    /*
     * Do nothing if there are no photos.
     */

    if (
        PHOTOS.length === 0
    ) {

        return;

    }


    galleryIsOpen =
        true;


    galleryOpenTime =
        Date.now();


    photoViewStartTime =
        Date.now();


    /*
     * Start with first photo.
     */

    currentPhotoIndex =
        0;


    /*
     * Show popup.
     */

    galleryModal.classList.add(
        "active"
    );


    galleryModal.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Stop the main page from scrolling
     * while popup is open.
     */

    document.body.style.overflow =
        "hidden";


    /*
     * Display first photo.
     */

    showPhoto(
        0,
        "gallery_open"
    );


    /*
     * Analytics event.

     * analytics.js contains trackEvent().
     */

    trackEvent(
        "photo_gallery_open",
        {

            gallery:
                "profile_gallery",

            total_photos:
                PHOTOS.length

        }
    );

}


/* =============================================================
   8. CLOSE PHOTO POPUP
   ============================================================= */

function closeGallery() {


    /*
     * Ignore if already closed.
     */

    if (
        !galleryIsOpen
    ) {

        return;

    }


    /*
     * Save time spent viewing current photo.
     */

    recordCurrentPhotoDuration();


    /*
     * Calculate total gallery duration.
     */

    const galleryDuration =
        Math.round(

            (
                Date.now()
                -
                galleryOpenTime
            ) / 1000

        );


    const photo =
        PHOTOS[
            currentPhotoIndex
        ];


    /*
     * Analytics event.
     */

    trackEvent(
        "photo_gallery_close",
        {

            gallery:
                "profile_gallery",

            total_gallery_duration:
                galleryDuration,

            photo_name:
                photo.title,

            photo_number:
                currentPhotoIndex + 1

        }
    );


    /*
     * Hide popup.
     */

    galleryModal.classList.remove(
        "active"
    );


    galleryModal.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
     * Allow the main page to scroll again.
     */

    document.body.style.overflow =
        "";


    /*
     * Reset state.
     */

    galleryIsOpen =
        false;

    galleryOpenTime =
        null;

    photoViewStartTime =
        null;

}


/* =============================================================
   9. SHOW PHOTO
   ============================================================= */

function showPhoto(
    index,
    action = "unknown"
) {


    /*
     * Make sure the requested photo exists.
     */

    if (
        index < 0
        ||
        index >= PHOTOS.length
    ) {

        return;

    }


    /*
     * If changing photos, record time spent
     * on previous photo.
     */

    if (

        galleryIsOpen
        &&
        photoViewStartTime !== null
        &&
        index !== currentPhotoIndex

    ) {

        recordCurrentPhotoDuration();

    }


    /*
     * Remember old position.
     */

    const oldIndex =
        currentPhotoIndex;


    /*
     * Determine animation direction.
     */

    let direction =
        "next";


    if (
        index < oldIndex
        ||
        (
            oldIndex === 0
            &&
            index ===
                PHOTOS.length - 1
        )
    ) {

        direction =
            "prev";

    }


    /*
     * Update current photo.
     */

    currentPhotoIndex =
        index;


    /*
     * Start timer for new photo.
     */

    photoViewStartTime =
        Date.now();


    const photo =
        PHOTOS[
            currentPhotoIndex
        ];


    /* =========================================================
       UPDATE MAIN PHOTO
       ========================================================= */

    popupMainPhoto.src =
        photo.src;


    popupMainPhoto.alt =
        photo.title;


    /* =========================================================
       PHOTO ANIMATION
       ========================================================= */

    popupMainPhoto.classList.remove(
        "photo-slide-next",
        "photo-slide-prev"
    );


    /*
     * Force browser to reset animation.
     */

    void popupMainPhoto.offsetWidth;


    if (
        action === "next"
        ||
        action === "gallery_open"
    ) {

        popupMainPhoto.classList.add(
            "photo-slide-next"
        );

    }


    if (
        action === "previous"
    ) {

        popupMainPhoto.classList.add(
            "photo-slide-prev"
        );

    }


    if (
        action === "thumbnail"
    ) {

        popupMainPhoto.classList.add(

            direction === "next"
            ?
            "photo-slide-next"
            :
            "photo-slide-prev"

        );

    }


    /* =========================================================
       PHOTO COUNTER
       ========================================================= */

    popupPhotoCounter.textContent =

        (
            currentPhotoIndex + 1
        )
        +
        " / "
        +
        PHOTOS.length;


    /* =========================================================
       PHOTO CAPTION
       ========================================================= */

    popupPhotoCaption.textContent =
        photo.title;


    /* =========================================================
       ACTIVE THUMBNAIL
       ========================================================= */

    document
        .querySelectorAll(
            ".popup-thumbnail"
        )
        .forEach(
            function(
                thumbnail,
                thumbnailIndex
            ) {

                thumbnail.classList.toggle(

                    "active",

                    thumbnailIndex
                    ===
                    currentPhotoIndex

                );

            }
        );


    /*
     * Automatically scroll active thumbnail into view.
     */

    scrollActiveThumbnailIntoView();


    /* =========================================================
       ANALYTICS
       ========================================================= */


    /*
     * First photo displayed.
     */

    if (
        action === "gallery_open"
    ) {

        trackEvent(
            "photo_first_displayed",
            {

                photo_name:
                    photo.title,

                photo_number:
                    currentPhotoIndex + 1,

                total_photos:
                    PHOTOS.length,

                gallery:
                    "profile_gallery"

            }
        );

    }


    /*
     * Next button.
     */

    if (
        action === "next"
    ) {

        trackEvent(
            "photo_next",
            {

                photo_name:
                    photo.title,

                photo_number:
                    currentPhotoIndex + 1,

                total_photos:
                    PHOTOS.length,

                gallery:
                    "profile_gallery"

            }
        );

    }


    /*
     * Previous button.
     */

    if (
        action === "previous"
    ) {

        trackEvent(
            "photo_previous",
            {

                photo_name:
                    photo.title,

                photo_number:
                    currentPhotoIndex + 1,

                total_photos:
                    PHOTOS.length,

                gallery:
                    "profile_gallery"

            }
        );

    }


    /*
     * Thumbnail click.
     */

    if (
        action === "thumbnail"
    ) {

        trackEvent(
            "photo_thumbnail_click",
            {

                photo_name:
                    photo.title,

                photo_number:
                    currentPhotoIndex + 1,

                total_photos:
                    PHOTOS.length,

                gallery:
                    "profile_gallery"

            }
        );

    }

}


/* =============================================================
   10. NEXT PHOTO
   ============================================================= */

function nextPhoto() {


    if (
        PHOTOS.length === 0
    ) {

        return;

    }


    const nextIndex =

        (
            currentPhotoIndex
            +
            1
        )
        %
        PHOTOS.length;


    showPhoto(
        nextIndex,
        "next"
    );

}


/* =============================================================
   11. PREVIOUS PHOTO
   ============================================================= */

function previousPhoto() {


    if (
        PHOTOS.length === 0
    ) {

        return;

    }


    const previousIndex =

        (
            currentPhotoIndex
            -
            1
            +
            PHOTOS.length
        )
        %
        PHOTOS.length;


    showPhoto(
        previousIndex,
        "previous"
    );

}


/* =============================================================
   12. PHOTO VIEW DURATION
   ============================================================= */

function recordCurrentPhotoDuration() {


    if (
        photoViewStartTime ===
        null
    ) {

        return;

    }


    const duration =
        Math.round(

            (
                Date.now()
                -
                photoViewStartTime
            ) / 1000

        );


    /*
     * Ignore extremely short events.
     */

    if (
        duration < 1
    ) {

        return;

    }


    const photo =
        PHOTOS[
            currentPhotoIndex
        ];


    trackEvent(
        "photo_view_duration",
        {

            photo_name:
                photo.title,

            photo_number:
                currentPhotoIndex + 1,

            duration_seconds:
                duration,

            gallery:
                "profile_gallery"

        }
    );


    /*
     * Reset timer.
     */

    photoViewStartTime =
        Date.now();

}


/* =============================================================
   13. SWIPE / DRAG
   -------------------------------------------------------------
   
   Phone:
       Swipe LEFT  -> Next
       Swipe RIGHT -> Previous

   Desktop:
       Drag LEFT  -> Next
       Drag RIGHT -> Previous
   ============================================================= */

function initializeSwipeTracking() {


    /*
     * Pointer DOWN
     */

    photoStage.addEventListener(
        "pointerdown",
        function(event) {


            if (
                !galleryIsOpen
            ) {

                return;

            }


            /*
             * Don't start dragging from a button.
             */

            if (
                event.target.closest(
                    "button"
                )
            ) {

                return;

            }


            pointerStartX =
                event.clientX;


            pointerStartY =
                event.clientY;


            pointerCurrentX =
                event.clientX;


            isDragging =
                true;


            /*
             * Capture pointer.
             */

            try {

                photoStage.setPointerCapture(
                    event.pointerId
                );

            } catch (_) {}

        }
    );


    /*
     * Pointer MOVE
     */

    photoStage.addEventListener(
        "pointermove",
        function(event) {


            if (
                !isDragging
            ) {

                return;

            }


            pointerCurrentX =
                event.clientX;

        }
    );


    /*
     * Pointer UP
     */

    photoStage.addEventListener(
        "pointerup",
        function(event) {


            if (
                !isDragging
            ) {

                return;

            }


            pointerCurrentX =
                event.clientX;


            const horizontalDistance =

                pointerCurrentX
                -
                pointerStartX;


            const verticalDistance =

                event.clientY
                -
                pointerStartY;


            isDragging =
                false;


            /*
             * Release pointer.
             */

            try {

                photoStage.releasePointerCapture(
                    event.pointerId
                );

            } catch (_) {}


            /*
             * Ignore mostly vertical movement.
             */

            if (
                Math.abs(horizontalDistance)
                <
                Math.abs(verticalDistance)
            ) {

                return;

            }


            /*
             * Ignore tiny movement.
             */

            if (
                Math.abs(horizontalDistance)
                <
                SWIPE_DISTANCE
            ) {

                return;

            }


            /*
             * LEFT -> NEXT
             */

            if (
                horizontalDistance < 0
            ) {


                nextPhoto();


                trackEvent(
                    "photo_swipe",
                    {

                        direction:
                            "left",

                        photo_name:
                            PHOTOS[
                                currentPhotoIndex
                            ].title,

                        photo_number:
                            currentPhotoIndex + 1,

                        gallery:
                            "profile_gallery"

                    }
                );

            }


            /*
             * RIGHT -> PREVIOUS
             */

            else {


                previousPhoto();


                trackEvent(
                    "photo_swipe",
                    {

                        direction:
                            "right",

                        photo_name:
                            PHOTOS[
                                currentPhotoIndex
                            ].title,

                        photo_number:
                            currentPhotoIndex + 1,

                        gallery:
                            "profile_gallery"

                    }
                );

            }

        }
    );


    /*
     * Pointer CANCEL
     */

    photoStage.addEventListener(
        "pointercancel",
        function() {

            isDragging =
                false;

        }
    );

}


/* =============================================================
   14. KEEP ACTIVE THUMBNAIL VISIBLE
   ============================================================= */

function scrollActiveThumbnailIntoView() {


    const thumbnails =
        document.querySelectorAll(
            ".popup-thumbnail"
        );


    const activeThumbnail =
        thumbnails[
            currentPhotoIndex
        ];


    if (
        activeThumbnail
    ) {

        activeThumbnail.scrollIntoView(
            {

                behavior:
                    "smooth",

                block:
                    "nearest",

                inline:
                    "center"

            }
        );

    }

}


/* =============================================================
   15. KEYBOARD NAVIGATION
   ============================================================= */

function initializeKeyboardControls() {


    document.addEventListener(
        "keydown",
        function(event) {


            if (
                !galleryIsOpen
            ) {

                return;

            }


            /*
             * LEFT ARROW
             */

            if (
                event.key ===
                "ArrowLeft"
            ) {

                event.preventDefault();

                previousPhoto();

            }


            /*
             * RIGHT ARROW
             */

            if (
                event.key ===
                "ArrowRight"
            ) {

                event.preventDefault();

                nextPhoto();

            }


            /*
             * ESCAPE
             */

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                closeGallery();

            }

        }
    );

}


/* =============================================================
   16. PAGE CLOSED WHILE GALLERY IS OPEN
   ============================================================= */

window.addEventListener(
    "pagehide",
    function() {


        if (
            galleryIsOpen
        ) {

            recordCurrentPhotoDuration();

        }

    }
);


/* =============================================================
   17. START GALLERY
   ============================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeGallery();

    }
);