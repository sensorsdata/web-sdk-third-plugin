window.getTitleByDescriptionMeta = function () { "use strict"; function t(t, n, r) { if (n && (t.plugin_name = n), r && t.init) { var i = t.init; t.init = function (o, u) { function l() { i.call(t, o, u) } return e(o, t, n), o.readyState && o.readyState.state >= 3 || !o.on ? l() : void o.on(r, l) } } return t } function e(t, e, n) { function r(e, r) { t.logger ? t.logger.msg.apply(t.logger, r).module(n + "" || "").level(e).log() : t.log && t.log.apply(t, r) } e.log = function () { r("log", arguments) }, e.warn = function () { r("warn", arguments) }, e.error = function () { r("error", arguments) } } function n(e, n, i) { return t(e, n, i), e.plugin_version = r, e } var r = "1.25.13", i = { plugin_name: "getTitleByDescriptionMeta", getTitle: function () { var t = ""; if (!document.querySelectorAll) return "\u5f53\u524d\u6d4f\u89c8\u5668\u7248\u672c\u592a\u4f4e"; var e = document.querySelectorAll("head meta[name='description']"); return e && e[0] && e[0].getAttribute("content") && (t = e[0].getAttribute("content")), t }, init: function (t) { var e = this.getTitle(); t.ee.sdk.on("afterInitAPI", function () { t.registerPropertyPlugin({ isMatchedWithFilter: function (t) { return "track" === t.type }, properties: function (n) { t._.isString(n.properties.$title) && (n.properties.$title = e) } }) }) } }, o = n(i); return o }();