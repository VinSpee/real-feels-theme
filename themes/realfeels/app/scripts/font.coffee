Font =
	load: ->
		((d) ->
			config =
				kitId: "kpd2sqh"
				scriptTimeout: 3000

			h = d.documentElement
			t = setTimeout(->
				h.className = h.className.replace(/\bwf-loading\b/g, "") + " wf-inactive"
				return
			, config.scriptTimeout)
			tk = d.createElement("script")
			f = false
			s = d.getElementsByTagName("script")[0]
			a = undefined
			h.className += " wf-loading"
			tk.src = "//use.typekit.net/" + config.kitId + ".js"
			tk.async = true
			tk.onload = tk.onreadystatechange = ->
				a = @readyState
				return	if f or a and a isnt "complete" and a isnt "loaded"
				f = true
				clearTimeout t
				try
					Typekit.load config
				return

			s.parentNode.insertBefore tk, s
			return
		) document
module.exports = Font
