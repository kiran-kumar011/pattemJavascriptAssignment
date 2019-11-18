let articlesArr = [], page = 1, limit = 10, query = 'reactjs', totalCount = 0, errorMessage, isLoading = true, timer = 0;


// selecting static elements...
let articlesWrapper = document.querySelector('.articles-wrapper');
let input = document.querySelector('.input');
let searchBtn = document.querySelector('.fa-search');
let timerElm = document.querySelector('.seconds');


const displayAllData = (arr) => {
	return (
		arr.map(art => {
			return (
				`<div class='article'>
						<div class=${art.urlToImage ? 'image-wrapper' : 'image-wrapper empty-image'}>
							<img 
								data-src 
								class='icon-image lazy-image'
								src=${art.urlToImage ? art.urlToImage : 'http://www.4motiondarlington.org/wp-content/uploads/2013/06/No-image-found.jpg'}
								alt="image"
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
			console.log(res, 'response');
			const { totalResults, articles, status } = res;
			if(status === 'ok' && totalResults) {
				articlesArr = articles, totalCount = totalResults;
			} else {
				articlesArr = [], errorMessage = `No results found for ${query}`;
			}
		
			const data = displayAllData(articlesArr);
			articlesWrapper.innerHTML = '';
			articlesWrapper.innerHTML =  data.join('');
			addListenerToScroll();
		}).catch(err => {
			console.log(err, 'error');
			errorMessage = 'Something went wrong', articlesArr = [];
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
			}).catch(err => {
				console.log(err, 'error');
				errorMessage = 'Something went wrong', articlesArr = [];
			});

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

		console.log(window.innerHeight + window.scrollY, 'window scroll', isLoading);
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !isLoading) {
			stopListener();
 			loadMoreData();
    }
	})
}

input.addEventListener('keydown', (e) => {
	if(e.keyCode === 13 && e.target.value.trim()) {
		query = e.target.value.trim();
		fetchNewData();
	}
});

searchBtn.addEventListener('click', (e) => {
	query = input.value;
	fetchNewData();
});

const reloadMoreData = () => {
	if(articlesArr.length >= totalCount) {
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
			}).catch(err => {
				console.log(err, 'error');
				errorMessage = 'Something went wrong', articlesArr = [];
			});
	}
}


const tick = async () => {
	if(articlesArr.length && timer === 30) {
		timer = 1;
		timerElm.innerText = timer;
		await reloadMoreData();
	} else {
		timer	= timer + 1;
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
}

staticLoader();


setInterval(tick, 1000);


