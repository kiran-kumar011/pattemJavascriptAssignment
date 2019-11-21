let articlesArr = [], page = 1, limit = 10, query = 'reactjs', totalCount = 0, errorMessage, isLoading = true, timer = 30, apiKey = `5eddff77effb4574956c391597a288db`, isAllDisplayed = false;


// change ("variable apiKey value") if the API request limit has been reached to maximum...
// APIKey(local) = 5eddff77effb4574956c391597a288db
// APIKey(Pattem) = 363d26dd3d664d199ca63adc371e22aa


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
						<div class=${art.urlToImage ? 'image-wrapper' : 'image-wrapper'}>
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
	fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}&pageSize=${limit}&page=${page}`).then(res => res.json()).then(res => {
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
			timer = 30;
			timerElm.innerText = timer;
			addListenerToScroll();
			lazyLoader();
			if(errorMessage) {
				error.innerText = errorMessage;
				displayError();
			}
		}).catch(err => {
			console.log(err, 'error');
			errorMessage = 'Something went wrong', articlesArr = [];
			error.innerText = errorMessage;
			displayError();
		});
	isLoading = false;
	return;
}

const loadMoreData = () => {
	if(articlesArr.length === totalCount) {
		errorMessage = 'Displaying all the results', isAllDisplayed = true;
		error.innerText = errorMessage;
		displayError();
		return;
	}
	page = page + 1;
	fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}&pageSize=${limit}&page=${page}`).then(res => res.json()).then(res => {
			const { totalResults, articles, status } = res;
			if(status === 'ok' && totalResults) {
				articlesArr = articlesArr.concat(articles);
				const data = displayAllData(articlesArr);
				articlesWrapper.innerHTML =  data.join('');
				lazyLoader();
				displayError();
			} else if(status === 'error') {
				articlesArr = [];
				errorMessage = res.message;
				error.innerText = errorMessage;
				displayError();
			}
		}).catch(err => {
			console.log(err, 'error');
			errorMessage = 'Something went wrong', articlesArr = [];
			displayError();
		});
}

const displayError = () => {
	setTimeout(() => {
		if(!isAllDisplayed) {
			error.innerText = '';
		}
	}, 3000);
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

		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !isLoading && !isAllDisplayed) {
			stopListener();
 			loadMoreData();
    }
	})
}

input.addEventListener('keydown', async (e) => {
	if(e.keyCode === 13 && e.target.value.trim()) {
		query = e.target.value.trim();
		await fetchNewData();
	}
});

searchBtn.addEventListener('click', (e) => {
	query = input.value;
	fetchNewData();
});

const reloadMoreData = () => {
	let length = articlesArr.length;
	fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}&pageSize=${length ? length : limit}&page=1`).then(res => res.json()).then(res => {
			const { totalResults, articles, status } = res;
			if(status === 'ok' && totalResults) {
				articlesArr = articles, totalCount = totalResults;
				const data = displayAllData(articlesArr);
				articlesWrapper.innerHTML =  data.join('');
				lazyLoader();
			} else if(status === 'error') {
				articlesArr = [];
				errorMessage = res.mesage;
				displayError();
			}
		}).catch(err => {
			console.log(err, 'error');
			errorMessage = 'Something went wrong', articlesArr = [];
		});
}


const tick = async () => {
	if(articlesArr.length && timer === 0 || timer <= 0 ) {
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
	img.removeAttribute('data-src');
	// console.log(img, 'atribute')
	if(!src) {
		return;
	}
	img.src = src;
}


function lazyLoader() {
	setTimeout(() => {
		let images = document.querySelectorAll('[data-src]');

		const options = {};

		const observer = new IntersectionObserver(function(entries, observer) {
			entries.forEach(entry => {
				if(!entry.isIntersecting) {
					return;
				} else {
					preloadImage(entry.target);
					entry.target.classList.remove('static-image-wrapper');
					observer.unobserve(entry.target);
				}
			})
		}, options);

		images.forEach(img => observer.observe(img));
	}, 100);
}



