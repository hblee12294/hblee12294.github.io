(() => {
	function setEventListener() {
		const pics = document.querySelectorAll('.pic_base');
		for (let pic of pics) {
			pic.addEventListener('click', transform);
		}
	}

	function transform(event) {
		const imgs = event.target.parentNode.parentNode.children;
		for (let img of imgs) {
			img.classList.toggle('pic_base');
			img.removeEventListener('click', transform);
		}
		setEventListener();
	}

	setEventListener();	
})();