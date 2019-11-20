let articlesArr = [], page = 1, limit = 10, query = 'reactjs', totalCount = 0, errorMessage, isLoading = true, timer = 30;


// take care of card view.

// selecting static elements...
let articlesWrapper = document.querySelector('.articles-wrapper');
let input = document.querySelector('.input');
let searchBtn = document.querySelector('.fa-search');
let timerElm = document.querySelector('.seconds');
let error = document.querySelector('.error');


const displayAllData = (arr) => {
	return (
		arr.map(art => {
			return (
				`<div class='article'>
						<div class=${art.urlToImage ? 'image-wrapper' : 'image-wrapper empty-image'}>
							<img 
								data-src=${art.urlToImage ? art.urlToImage : 'http://www.4motiondarlington.org/wp-content/uploads/2013/06/No-image-found.jpg'}
								class='icon-image lazy-image static-image-wrapper'
							/>
						</div>
						<div>
							<div class='article-title'>
								<p>${art.title}</p>
							</div>
							<div>
								<p>${art.author ? art.author : ''}</p>
							</div>
						</div>
					</div>`
			)
		})
	)
}

const fetchNewData = async () => {
	page = 1;
	fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=5eddff77effb4574956c391597a288db&pageSize=${limit}&page=${page}`).then(res => res.json()).then(res => {
			const { totalResults, articles, status } = res;
			if(status === 'ok' && totalResults) {
				articlesArr = articles, totalCount = totalResults;
			} else if(status === 'error') {
				articlesArr = [], errorMessage = res.message ? res.message : `No results found for ${query}`;
			}

			const data = displayAllData(articlesArr);
			articlesWrapper.innerHTML = '';
			input.value = query;
			articlesWrapper.innerHTML =  data.join('');
			addListenerToScroll();
			lazyLoader();
			displayError();
		}).catch(err => {
			console.log(err, 'error');
			errorMessage = 'Something went wrong', articlesArr = [];
			displayError();
		});
	isLoading = false;
	
}

const loadMoreData = () => {
	if(articlesArr.length === totalCount) return;
		page = page + 1;
		fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=5eddff77effb4574956c391597a288db&pageSize=${limit}&page=${page}`).then(res => res.json()).then(res => {
				const { totalResults, articles, status } = res;
				if(status === 'ok' && totalResults) {
					articlesArr = articlesArr.concat(articles);
				} else {
					articlesArr = [];
				}

				const data = displayAllData(articlesArr);
				articlesWrapper.innerHTML =  data.join('');
				lazyLoader();
				displayError();
			}).catch(err => {
				console.log(err, 'error');
				errorMessage = 'Something went wrong', articlesArr = [];
				displayError();
			});
}

const displayError = () => {
	if(errorMessage) {
		error.innerText = errorMessage;
	}
	console.log('displayError');
	setTimeout(() => {

		error.value = '';
	}, 2000);
}


const stopListener = () => {
	isLoading = true;
	startlistener();
}

const startlistener = () => {
	setTimeout(() => {
		isLoading = false;
	}, 400);
}

const addListenerToScroll = () => {
	window.addEventListener('scroll', () => {

		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !isLoading) {
			stopListener();
 			loadMoreData();
    }
	})
}

input.addEventListener('keydown', async (e) => {
	if(e.keyCode === 13 && e.target.value.trim()) {
		query = e.target.value.trim();
		await fetchNewData();
		timer = 30;
		timerElm.innerText = timer;
	}
});

searchBtn.addEventListener('click', (e) => {
	query = input.value;
	fetchNewData();
});

const reloadMoreData = () => {
	if(articlesArr.length >= totalCount) {
		errorMessage = 'Showing all the results';
		displayError();
		return;
	} else {
		let length = articlesArr.length;
		fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=5eddff77effb4574956c391597a288db&pageSize=${length}&page=${page}`).then(res => res.json()).then(res => {
				const { totalResults, articles, status } = res;
				if(status === 'ok' && totalResults) {
					articlesArr = articles;
				} else {
					articlesArr = [];
				}

				const data = displayAllData(articlesArr);
				articlesWrapper.innerHTML =  data.join('');
				lazyLoader();
			}).catch(err => {
				console.log(err, 'error');
				errorMessage = 'Something went wrong', articlesArr = [];
			});
	}
}


const tick = async () => {
	if(articlesArr.length && timer === 0) {
		timer = 30;
		timerElm.innerText = timer;
		await reloadMoreData();
	} else {
		timer	= timer - 1;
		timerElm.innerText = timer;
	}
}


const Article = `<div className='article'>
									<div className='static-image-wrapper'>
									</div>
									<div>
										<div className='static-article-title'>
											<p></p>
										</div>
										<div className='static-article-author'>
											<p></p>
										</div>
									</div>
								</div>`;


const staticLoader = async () => {
	let arr = [];
	for(let i=0; i<limit; i++) {
		arr.push(i);
	}

	const staticElements = (arr.map(itm => (Article))).join('');
	articlesWrapper.innerHTML = '';
	articlesWrapper.innerHTML = staticElements;
	await fetchNewData();
	setInterval(tick, 1000);
}

staticLoader();


function preloadImage(img) {
	const src = img.getAttribute('data-src');
	if(!src) {
		return;
	}
	img.src = src;
}


function preloadTitle(para) {
	const title = para.getAttribute('data-title');
	if(!title) {
		return;
	}
	para.innerText = title;
}


function lazyLoader() {
	setTimeout(() => {
		let images = document.querySelectorAll('[data-src]');
		let titles = document.querySelectorAll('[data-title]');
		// console.log(images, 'articles');
		const options = {};

		const observer = new IntersectionObserver(function(entries, observer) {
			entries.forEach(entry => {
				if(!entry.isIntersecting) {
					return;
				} else {
					console.log(entry.target.classList.contains('lazy-image'), 'isIntersecting');
					if(entry.target.classList.contains('lazy-image')) {
						preloadImage(entry.target);
						entry.target.classList.remove('static-image-wrapper');
						observer.unobserve(entry.target);
					} else {
						preloadTitle(entry.target);
						// entry.target.classList.remove('')
					}
					observer.unobserve(entry.target);
				}
			})
		}, options);

		images.forEach(img => observer.observe(img));
		titles.forEach(titl => observer.observe(titl));
	}, 500);
}



