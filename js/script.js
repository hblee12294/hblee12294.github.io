(() => {
	function setEventListener() {
		document.querySelector('.pic_base').addEventListener('click', transform);
	}

	function transform() {
		const imgs = document.querySelectorAll('#pj1 .pic');
		for (let img of imgs) {
			img.classList.toggle('pic_base');
		}
		setEventListener();
	}

	setEventListener();	
})();