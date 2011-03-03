
function PPE_Infowindow_v2(latlng,opts) {
  this.latlng_ = latlng;
	this.information_ = opts;
  this.offsetVertical_ = -125;
  this.offsetHorizontal_ = -161;
  this.height_ = 130;
  this.width_ = 348;
}
PPE_Infowindow_v2.prototype = new GOverlay();

PPE_Infowindow_v2.prototype.initialize = function(map) {
	
	var me = this;
	
	div = document.createElement('DIV');
  div.style.border = "none";
  div.style.position = "absolute";
  div.style.paddingLeft = "0px";
	div.style.zIndex = '100';
	div.style.width = '348px';
	div.style.height = '130px';
	div.style.background = 'url(http://ec2-174-129-149-237.compute-1.amazonaws.com/html/LifeWeb/images/infowindows/area_bkg.png) no-repeat 0 0';
	
	var close = document.createElement('a');
		close.style.position = "absolute";
		close.style.top = '-7px';
		close.style.right = '2px'; 
	  close.style.width = "17px";
	  close.style.height = "17px";
		close.style.background = "url(http://ec2-174-129-149-237.compute-1.amazonaws.com/html/LifeWeb/images/infowindows/close_window.png) no-repeat 0 -17px";
		$(close).hover(function(ev){
			$(this).css('background','url(http://ec2-174-129-149-237.compute-1.amazonaws.com/html/LifeWeb/images/infowindows/close_window.png) no-repeat 0 0');
		}, function(ev){
			$(this).css('background','url(http://ec2-174-129-149-237.compute-1.amazonaws.com/html/LifeWeb/images/infowindows/close_window.png) no-repeat 0 -17px');
		});
		close.style.cursor = "pointer";
		div.appendChild(close);
		
		var imgDiv = document.createElement('div');
		imgDiv.style.position = "absolute";
		imgDiv.style.top = '13px';
		imgDiv.style.left = '11px'; 
		imgDiv.style.width = "108px";
		imgDiv.style.height = "83px";
		imgDiv.style.border = '1px solid #CCCCCC';
		
		div.appendChild(imgDiv);
	
		var image_place = document.createElement("img");
		image_place.style.position = "absolute";
		image_place.style.float = 'left';
	  image_place.style.width = "100px";
	  image_place.style.height = "75px";
		image_place.style.border = '4px solid #E5E5E5';
		if (this.information_.image!=null) {
			if (this.information_.image=='/images/defaults/site/default_terrestrial.jpg') {
				image_place.src = "http://protectedplanet.net/images/defaults/site/default_terrestrial.jpg";
			} else {
				image_place.src = this.information_.image;
			}
		} else {
			image_place.src = 'http://mw2.google.com/mw-panoramio/photos/small/5110708.jpg';
		}
		imgDiv.appendChild(image_place);
	
		var title = document.createElement('p');
		title.style.float = "left";
		title.style.margin = '15px 0 0 132px';
		title.style.padding = '0';
	  title.style.width = "189px";
		title.style.height = "20px";
		title.style.overflow = "hidden";
	
		var link_title = document.createElement('a');
		link_title.style.font = 'bold 15px Arial';
		link_title.style.color = '#FFFFFF';
		if (this.information_.name.length>40) {
			$(link_title).text(this.information_.name.substr(0,28)+'...');
		} else {
			$(link_title).text(this.information_.name);
		}
		$(link_title).attr('href','http://protectedplanet.net/sites/'+this.information_.id);
		$(link_title).attr('target','_blank');
		$(link_title).css('text-decoration','none');
		$(link_title).hover(function(ev){
			$(this).css('text-decoration','underline');
		}, function(ev){
			$(this).css('text-decoration','none');
		});
		title.appendChild(link_title);
		div.appendChild(title);
		
		
		// var country = document.createElement('p');
		// 		country.style.float = "left";
		// 		country.style.padding = '0';
		// 		country.style.width = "180px";
		// 		country.style.margin = '0 0 0 132px';
		// 		country.style.font = 'normal 13px Arial';
		// 		country.style.color = '#f7f7f7';
		// 		$(country).html('');
		// 		div.appendChild(country);
		
		var select = document.createElement('p');
		select.style.float = "left";
		select.style.padding = '0';
		select.style.width = "200px";
		select.style.margin = '32px 0 0 127px';
		select.style.font = 'normal 13px Arial';
		select.style.textDecoration = 'underline';
		select.style.color = '#006699';
		select.style.cursor = 'pointer';
		select.style.textAlign = "center";
		$(select).html('Calculate carbon in this<br/> protected area');
		div.appendChild(select);

	
    GEvent.addDomListener(select, "click", function(event) {
			choosePPEToCalculate();
    });

    GEvent.addDomListener(close, "click", function(event) {	
			me.map_.removeOverlay(ppe_marker);
    });
	


  map.getPane(G_MAP_FLOAT_PANE).appendChild(div);

  this.map_ = map;
  this.div_ = div;
}


PPE_Infowindow_v2.prototype.remove = function() {
  this.div_.parentNode.removeChild(this.div_);
}

PPE_Infowindow_v2.prototype.copy = function() {
  return new PPE_Infowindow_v2(this.latlng_,this.information_);
}

PPE_Infowindow_v2.prototype.redraw = function(force) {
  if (!force) return;

  var divPixel = this.map_.fromLatLngToDivPixel(this.latlng_);

  this.div_.style.width = this.width_ + "px";
  this.div_.style.left = (divPixel.x)-160 + "px"
  this.div_.style.height = (this.height_)+10 + "px";
  this.div_.style.top = (divPixel.y) - this.height_ + "px";
}

