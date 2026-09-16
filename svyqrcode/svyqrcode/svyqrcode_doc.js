/*
 * QR Code scanner. Reads QR codes from the device camera (rear camera when available)
 * and writes the decoded value into the bound dataProviderID. Requires a secure
 * context (HTTPS or localhost) — browsers only expose getUserMedia in secure contexts.
 */

/**
 * Two-way bound dataprovider that receives the decoded QR code value. When a code
 * is detected and its value differs from the current value, the dataprovider is
 * updated and the onCodeDetected handler is fired.
 */
var dataProviderID;

/**
 * When true, an outline is drawn on the video preview around the detected QR code
 * using codeFrameColor. Defaults to true.
 */
var showCodeFrame;

/**
 * Color of the outline drawn around the detected QR code when showCodeFrame is
 * true. Defaults to '#FF3B58'.
 */
var codeFrameColor;

/**
 * Minimum interval (in milliseconds) between two consecutive onCodeDetected calls
 * when the same code keeps being detected. Defaults to 1000ms. Set to 0 to fire on
 * every detection.
 */
var callbackMethodTimeout;


var handlers = {
    /**
     * Fired when a QR code is detected. Calls are throttled by callbackMethodTimeout
     * so that continuous detection of the same value does not flood the server.
     *
     * @param {JSEvent} event The event object containing details about the detection (target element is the scanner's canvas).
     * @param {string} code The decoded QR code value.
     */
    onCodeDetected: function() {}
};
