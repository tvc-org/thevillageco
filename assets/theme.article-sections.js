$(document).ready(function() {
	
	$('.article-container .inline-image').each(function() {
		let position = $(this).data('position');
		let photoIndex = (position) ? position : 0;
		let paragraphs = $(this).parent().find('> p');
		console.log("paragraphs.length: " + paragraphs.length);
		let target = $(paragraphs[position]);
		console.log("target.length: " + target.length);
		console.log("position: " + position);
		if (target.length) {
			$(this).insertBefore(target);
		}
	});
	
	$('.blog-carousel').each(function() {
		$(this).slick({
			arrows:true,
			dots:false,
			infinite:false,
			slidesToShow: 2.5,
			slidesToScroll: 2,
			responsive: [
				{   breakpoint:960,
					settings: {
						slidesToShow: 1.5,
						slidesToScroll: 1
					}
				},
				{   breakpoint:640,
					settings: {
						slidesToShow: 1.25,
						slidesToScroll: 1
					}
				}
			]
		});
	});
	
	$('.favorites-section.carousel').slick({
		mobileFirst: true,
		infinite:false,
		slidesToShow:1.2,
		arrows:false,
		responsive: [
			{
				breakpoint: 768,
				settings: {
					slidesToShow:3
				}
			}
		]
	});
	
});