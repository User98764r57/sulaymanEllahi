/*!
 * leaflet-extra-markers
 * Custom Markers for Leaflet JS based on Awesome Markers
 * Leaflet ExtraMarkers
 * https://github.com/coryasilva/Leaflet.ExtraMarkers/
 * @author coryasilva <https://github.com/coryasilva>
 * @version 1.2.1
 */

!function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t((e.leaflet = e.leaflet || {}, e.leaflet["extra-markers"] = {}))
}(this, function(e) {
    "use strict";
    var t = L.ExtraMarkers = {};
    t.version = L.ExtraMarkers.version = "1.2.1",
    t.Icon = L.ExtraMarkers.Icon = L.Icon.extend({
        options: {
            iconSize: [35, 45],
            iconAnchor: [17, 42],
            popupAnchor: [1, -32],
            shadowAnchor: [10, 12],
            shadowSize: [36, 16],
            className: "",
            prefix: "",
            extraClasses: "",
            shape: "circle",
            icon: "",
            innerHTML: "",
            markerColor: "red",
            svgBorderColor: "#fff",
            svgOpacity: 1,
            iconColor: "#fff",
            iconRotate: 0,
            number: "",
            svg: !1,
            name: ""
        },
        initialize: function(e) {
            e = L.Util.setOptions(this, e)
        },
        createIcon: function() {
            var e = document.createElement("div"),
                t = this.options;
            return t.icon && (e.innerHTML = this._createInner()), t.innerHTML && (e.innerHTML = t.innerHTML), t.bgPos && (e.style.backgroundPosition = -t.bgPos.x + "px " + -t.bgPos.y + "px"), t.svg ? this._setIconStyles(e, "svg") : this._setIconStyles(e, t.shape + "-" + t.markerColor), e
        },
        _getColorHex: function(e) {
            return {
                    red: "#a23337",
                    "orange-dark": "#d73e29",
                    orange: "#ef9227",
                    yellow: "#f5bb39",
                    "blue-dark": "#276273",
                    cyan: "#32a9dd",
                    purple: "#440444",
                    violet: "#90278d",
                    pink: "#c057a0",
                    green: "#006838",
                    white: "#e8e8e8",
                    black: "#211c1d"
                }[e] || e
        },
        _createSvg: function(e, t) {
            return {
                circle: '<svg width="32" height="44" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 2.746c-8.284 0-15 6.853-15 15.307 0 .963.098 1.902.265 2.816a15.413 15.413 0 002.262 5.684l.134.193 12.295 17.785 12.439-17.863.056-.08a15.422 15.422 0 002.343-6.112c.123-.791.206-1.597.206-2.423 0-8.454-6.716-15.307-15-15.307" fill="' + t + '" /><path d="M17.488 2.748c-8.284 0-15 6.853-15 15.307 0 .963.098 1.902.265 2.816a15.413 15.413 0 002.262 5.684l.134.193 12.295 17.785 12.44-17.863.055-.08a15.422 15.422 0 002.343-6.112c.124-.791.206-1.597.206-2.423 0-8.454-6.716-15.307-15-15.307m0 1.071c7.68 0 13.929 6.386 13.929 14.236 0 .685-.064 1.423-.193 2.258-.325 2.075-1.059 3.99-2.164 5.667l-.055.078-11.557 16.595L6.032 26.14l-.12-.174a14.256 14.256 0 01-2.105-5.29 14.698 14.698 0 01-.247-2.62c0-7.851 6.249-14.237 13.928-14.237" fill="#231f20" opacity=".15" /></svg>',
                square: '<svg width="33" height="44" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg"><path d="M28.205 3.217H6.777c-2.367 0-4.286 1.87-4.286 4.179v19.847c0 2.308 1.919 4.179 4.286 4.179h5.357l5.337 13.58 5.377-13.58h5.357c2.366 0 4.285-1.87 4.285-4.179V7.396c0-2.308-1.919-4.179-4.285-4.179" fill="' + t + '" /><g opacity=".15" transform="matrix(1.0714 0 0 -1.0714 -233.22 146.783)"><path d="M244 134h-20c-2.209 0-4-1.746-4-3.9v-18.525c0-2.154 1.791-3.9 4-3.9h5L233.982 95 239 107.675h5c2.209 0 4 1.746 4 3.9V130.1c0 2.154-1.791 3.9-4 3.9m0-1c1.654 0 3-1.301 3-2.9v-18.525c0-1.599-1.346-2.9-3-2.9h-5.68l-.25-.632-4.084-10.318-4.055 10.316-.249.634H224c-1.654 0-3 1.301-3 2.9V130.1c0 1.599 1.346 2.9 3 2.9h20" fill="#231f20" /></g></svg>',
                star: '<svg width="34" height="44" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg"><path d="M32.92 16.93l-3.525-3.525V8.419a1.983 1.983 0 00-1.983-1.982h-4.985L18.9 2.91a1.984 1.984 0 00-2.803 0l-3.524 3.526H7.588a1.983 1.983 0 00-1.982 1.982v4.986L2.081 16.93a1.982 1.982 0 000 2.803l3.525 3.526v4.984c0 1.096.888 1.983 1.982 1.983h4.986L17.457 45l4.97-14.773h4.985a1.983 1.983 0 001.983-1.983V23.26l3.525-3.526a1.982 1.982 0 000-2.803" fill="' + t + '" /><g opacity=".15" transform="matrix(1.0667 0 0 -1.0667 -347.3 97.26)"><path d="M342 89c-.476 0-.951-.181-1.314-.544l-3.305-3.305h-4.673a1.858 1.858 0 01-1.859-1.858v-4.674l-3.305-3.305a1.857 1.857 0 010-2.627l3.305-3.305v-4.674a1.86 1.86 0 011.859-1.859h4.673L341.959 49l4.659 13.849h4.674a1.86 1.86 0 011.859 1.859v4.674l3.305 3.305a1.858 1.858 0 010 2.627l-3.305 3.305v4.674a1.859 1.859 0 01-1.859 1.858h-4.674l-3.304 3.305A1.851 1.851 0 01342 89m0-1a.853.853 0 00.607-.251l3.304-3.305.293-.293h5.088a.86.86 0 00.859-.858v-5.088l3.598-3.598A.852.852 0 00356 74a.85.85 0 00-.251-.606l-3.598-3.598v-5.088a.86.86 0 00-.859-.859h-5.393l-.229-.681-3.702-11.006-3.637 11.001-.227.686h-5.396a.86.86 0 00-.859.859v5.088l-3.598 3.598c-.162.162-.251.377-.251.606s.089.445.251.607l3.598 3.598v5.088a.86.86 0 00.859.858h5.087l3.598 3.598A.853.853 0 00342 88" fill="#231f20" /></g></svg>',
                penta: '<svg width="33" height="44" viewBox="0 0 35 45" xmlns="http://www.w3.org/2000/svg"><path d="M1.872 17.35L9.679 2.993h15.615L33.1 17.35 17.486 44.992z" fill="' + t + '" /><g opacity=".15" transform="matrix(1.0769 0 0 -1.0769 -272.731 48.23)"><path d="M276.75 42h-14.5L255 28.668 269.5 3 284 28.668zm-.595-1l6.701-12.323L269.5 5.033l-13.356 23.644L262.845 41z" fill="#231f20" /></g></svg>'
            }[e]
        },
        _createInner: function() {
            var e = "",
                t = "",
                o = "",
                a = "",
                r = this.options;
            return r.iconColor && (e = "color: " + r.iconColor + ";"), 0 !== r.iconRotate && (e += "-webkit-transform: rotate(" + r.iconRotate + "deg);", e += "-moz-transform: rotate(" + r.iconRotate + "deg);", e += "-o-transform: rotate(" + r.iconRotate + "deg);", e += "-ms-transform: rotate(" + r.iconRotate + "deg);", e += "transform: rotate(" + r.iconRotate + "deg);"), r.number && (t = 'number="' + r.number + '" '), r.extraClasses.length && (o += r.extraClasses + " "), r.prefix.length && (o += r.prefix + " "), r.icon.length && (o += r.icon + " "), r.svg && (a += this._createSvg(r.shape, this._getColorHex(r.markerColor))), a += "<i " + t + 'style="' + e + '" class="' + o + '"></i>', r.name.length && (a += '<div class="' + (void 0 !== r.nameClasses ? r.nameClasses : "") + '">' + r.name + "</div>"), a
        },
        _setIconStyles: function(e, t) {
            var o,
                a,
                r = this.options,
                n = L.point(r["shadow" === t ? "shadowSize" : "iconSize"]);
            a = "shadow" === t ? (o = L.point(r.shadowAnchor || r.iconAnchor), "shadow") : (o = L.point(r.iconAnchor), "icon"),
            !o && n && (o = n.divideBy(2, !0)),
            e.className = "leaflet-marker-" + a + " extra-marker extra-marker-" + t + " " + r.className,
            o && (e.style.marginLeft = -o.x + "px", e.style.marginTop = -o.y + "px"),
            n && (e.style.width = n.x + "px", e.style.height = n.y + "px")
        },
        createShadow: function() {
            var e = document.createElement("div");
            return this._setIconStyles(e, "shadow"), e
        }
    }),
    t.icon = L.ExtraMarkers.icon = function(e) {
        return new L.ExtraMarkers.Icon(e)
    },
    e.ExtraMarkers = t,
    Object.defineProperty(e, "__esModule", {
        value: !0
    })
});
