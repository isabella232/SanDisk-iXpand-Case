(function () {
	var appMode = 'auth', contentMode = 'grid', filter = '.photo'
	var router
	var authView, gridView, wall, listView

	var lightGalleryOptions = {
	    mode: 'fade',
	    speed: 500,
	    thumbnail: false,
	    videoAutoplay: true,
	    videoMaxWidth: '100%'
	}

	var isLocal = (location.protocol === 'file:')

	var refresh = function () {
		switchAppMode(appMode)
		switchContentMode(contentMode)
		switchFilter(filter)
	}

	var switchAppMode = function (newAppMode) {
		appMode = newAppMode
		switch (appMode) {
			case 'auth':
				showAuth()
				hideAuthFailed()
				hideFileBrowser()
				break
			case 'file-browser':
				hideAuth()
				showFileBrowser()
				break
		}
	}

	var switchContentMode = function (newContentMode) {
		contentMode = newContentMode
		switch (contentMode) {
			case 'grid':
				$('.group.grid-wrap').removeClass('hidden').addClass('show')
				$('.group.list-wrap').removeClass('show').addClass('hidden')
				break
			case 'list':
		        $('.group.list-wrap').removeClass('hidden').addClass('show')
		        $('.group.grid-wrap').removeClass('show').addClass('hidden')
				break
		}
	}

	var switchFilter = function (newFilter) {
		filter = newFilter
		var title
		switch (filter) {
			case '.photo':
				fetchPhotos()
				title = 'photos on the case'
				break
			case '.video':
				fetchVideo()
				title = 'videos on the case'
				break
			case '.audio':
				fetchAudio()
				title = 'audio on the case'
				break
			case '.other':
				fetchOther()
				title = 'other files on the case'
				break
			default:
				title = 'files on the case'
				break
		}
		$('#title').html(title)
	}

	var showAuth = function () {
		$('#auth').removeClass('hidden').addClass('show')
		$('body').addClass('main-bg')
	}

	var hideAuth = function () {
		$('#auth').removeClass('show').addClass('hidden')
		$('body').removeClass('main-bg')
	}

	var showAuthFailed = function () {
		$('#auth-failure').removeClass('hidden').addClass('show')
	}

	var hideAuthFailed = function () {
		$('#auth-failure').removeClass('show').addClass('hidden')
	}

	var showFileBrowser = function () {
		$('#file-browser').removeClass('hidden').addClass('show')
		$('body').removeClass('main-bg')
	}

	var hideFileBrowser = function () {
		$('#file-browser').removeClass('show').addClass('hidden')
	}

	var authenticate = function (code, success, failure) {
		console.log("Auth with code " + code)

		if (isLocal) {
			console.log("Skipping auth")
			$.cookie('authcode', code)
			success && success()
			return
		}

		$.ajax("/auth", {
			data: {code: code}
		}).done(function (data) {
			var response = JSON.parse(data);
			if (response.success) {
				console.log("Auth successful")
				$.cookie('authcode', code)
				success && success()
			} else {
				console.log("Auth failed")
				$.removeCookie('authcode')
				failure && failure()
			}
		})
	}

	var fetchPhotos = function () {
		if (isLocal) {
			return
		}

		photoFiles.fetch().done(function () {
			console.log("Photos: " + JSON.stringify(photoFiles))

			gridView.files = sortFiles(photoFiles)
			gridView.render()

			listView.files = sortFiles(photoFiles)
			listView.render()
		}).fail(function (collection, response) {
			console.log("Failed to fetch photos: " + response)

			$.removeCookie('authcode')
			router.navigate('', {trigger: true})
		})
	}

	var fetchVideo = function () {
		if (isLocal) {
			return
		}
		
		videoFiles.fetch().done(function () {
			console.log("Videos: " + JSON.stringify(videoFiles))

			gridView.files = sortFiles(videoFiles)
			gridView.render()

			listView.files = sortFiles(videoFiles)
			listView.render()
		}).fail(function (collection, response) {
			console.log("Failed to fetch videos: " + response)

			$.removeCookie('authcode')
			router.navigate('', {trigger: true})
		})
	}

	var fetchAudio = function () {
		if (isLocal) {
			return
		}
		
		audioFiles.fetch().done(function () {
			console.log("Audio: " + JSON.stringify(audioFiles))

			gridView.files = sortFiles(audioFiles)
			gridView.render()

			listView.files = sortFiles(audioFiles)
			listView.render()
		}).fail(function (collection, response) {
			console.log("Failed to fetch audio: " + response)

			$.removeCookie('authcode')
			router.navigate('', {trigger: true})
		})
	}

	var fetchOther = function () {
		if (isLocal) {
			return
		}
		
		otherFiles.fetch().done(function () {
			console.log("Other files: " + JSON.stringify(otherFiles))

			gridView.files = sortFiles(otherFiles)
			gridView.render()

			listView.files = sortFiles(otherFiles)
			listView.render()
		}).fail(function (collection, response) {
			console.log("Failed to fetch other files: " + response)

			$.removeCookie('authcode')
			router.navigate('', {trigger: true})
		})
	}

	var sortFiles = function (files) {
		var sortedByDate = files.toJSON()
		sortedByDate.sort(function (a, b) {
			return compareMoments(moment(a.modificationDate), moment(b.modificationDate))
		})

		var sortedByName = files.toJSON()
		sortedByName.sort(function (a, b) {
			return a.name.localeCompare(b.name)
		})

		var moments = []
		var bucketed = {}
		sortedByDate.forEach(function (file) {
			var theMoment = moment(file.modificationDate).startOf('day')
			var dateString = theMoment.format('l')
			if (!bucketed[dateString]) {
				bucketed[dateString] = []
				moments.push(theMoment)
			}
			bucketed[dateString].push(file)
		})
		moments.sort(compareMoments)
		return {
			sortedByDate: sortedByDate,
			sortedByName: sortedByName,
			moments: moments,
			bucketed: bucketed
		}
	}

	var compareMoments = function (a, b) {
		return (a.isBefore(b) ? -1 : (a.isAfter(b) ? 1 : 0))
	}

	var File = Backbone.Model.extend({
		defaults: {
			id: null,
			name: null,
			path: null
		}
	})

	var PhotoCollection = Backbone.Collection.extend({
		url: '/api/photo',
		model: File,
		parse: function (data) {
			return data.files
		}
	})

	var VideoCollection = Backbone.Collection.extend({
		url: '/api/video',
		model: File,
		parse: function (data) {
			return data.files
		}
	})

	var AudioCollection = Backbone.Collection.extend({
		url: '/api/audio',
		model: File,
		parse: function (data) {
			return data.files
		}
	})

	var OtherCollection = Backbone.Collection.extend({
		url: '/api/other',
		model: File,
		parse: function (data) {
			return data.files
		}
	})

	var photoFiles = new PhotoCollection()
	var videoFiles = new VideoCollection()
	var audioFiles = new AudioCollection()
	var otherFiles = new OtherCollection()

	var AuthView = Backbone.View.extend({
		el: '#auth'
	})

	var GridView = Backbone.View.extend({
		el: '#grid-view',
		initialize: function () {
			this.template = Handlebars.compile($('#grid-template').html())
		},
		render: function () {
			this.$el.html(this.template({
				files: this.files
			}))

			$('.grid').each(function () {
			    var wall = new freewall(this)
			    wall.reset({
			        selector: '.grid-item',
			        animate: true,
			        cellW: 175,
			        cellH: 175,
			        fixSize: 1,
			        onResize: function () {
			            wall.refresh()
			        }
			    })
			    wall.fitWidth()
			})

			gridView.$el.lightGallery({
				selector: '.src-link'
			})
		}
	})

	var ListView = Backbone.View.extend({
		el: '#list-view',
		initialize: function () {
			this.template = Handlebars.compile($('#list-template').html())
		},
		render: function () {
			this.$el.html(this.template({
				files: this.files
			}))

			$('.delete').click(function () {
				var path = $(this).attr('data-path')
				console.log("Deleting file at " + path)
				$.ajax("/api/delete" + path).done(function (data) {
					var response = JSON.parse(data)
					if (response.success) {
						console.log("Delete successful")
						refresh()
					} else {
						console.log("Delete failed")
					}
				})
			})

			listView.$el.lightGallery({
				selector: '.src-link'
			})
		}
	})

	var Router = Backbone.Router.extend({
		routes: {
			'': 'root',
			'browse/*path': 'browse',
			'*other': 'other'
		},
		root: function () {
			switchAppMode('auth')

			if ($.cookie('authcode')) {
				authenticate($.cookie('authcode'), function () {
					hideAuthFailed()
					router.navigate('browse/', {trigger: true})
				})
				return
			}
		},
		browse: function (path) {
			if (!$.cookie('authcode')) {
				console.log("Not authenticated, routing to root")
				this.navigate('', {trigger: true})
				return
			}

			switchAppMode('file-browser')

			if (path === null) {
				path = ''
			}

			console.log("Routing to browse/" + path)

			refresh()
		},
		other: function () {
			console.log("Routing to default")
			this.navigate('', {trigger: true})
		}
	})
	router = new Router()
	Backbone.history.start({pushState: true})

	Handlebars.registerHelper('browsePath', function (file) {
		var path
		if (file.type == 'directory') {
			path = "/browse" + file.path + "/"
		} else {
			path = "/files" + file.path
		}
		return path
	})

	Handlebars.registerHelper('sizeToString', function (size) {
		return numeral(size).format('0.00 b')
	})

	Handlebars.registerHelper('momentToString', function (aMoment) {
		return aMoment.format('l')
	})

	Handlebars.registerHelper('reformatDate', function (dateString) {
		return moment(dateString).format('l')
	})

	Handlebars.registerHelper('bucketForMoment', function (files, aMoment) {
		return files.bucketed[aMoment.format('l')]
	})

	$(function () {
		authView = new AuthView()
		gridView = new GridView()
		listView = new ListView()

		$('#auth-form').submit(function () {
			event.preventDefault()
			var code = $('#auth-code-input').val()
			authenticate(code, function () {
				$('#auth-code-input').val("")
				hideAuthFailed()
				router.navigate('browse/', {trigger: true})
			}, function () {
				showAuthFailed()					
			})
		})

		$('#disconnect').click(function () {
			$.removeCookie('authcode')
			router.navigate('', {trigger: true})
		})

		Dropzone.options.theDropzone = {
			url: window.location.pathname,
			init: function () {
				this.on('complete', function (file) {
					refresh()
				})
			}
		}

		$('.filter-select li').click(function () {
		    $('.filter-select').find('li').removeClass('active')
		    $(this).addClass('active')

		    switchFilter($(this).attr('data-filter'))
		})

		$('.mode-select li').click(function () {
		    $('.mode-select').find('li').removeClass('active')
		    $(this).addClass('active')

		    switchContentMode($(this).attr('data-content-mode'))
		})

		switchAppMode('auth')
	})
})()
