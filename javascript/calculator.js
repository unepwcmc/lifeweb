var COLORS = [["#FF6600", "#FF6600"]];
var options = {};
var lineCounter_ = 0;
var shapeCounter_ = 0;
var markerCounter_ = 0;
var colorIndex_ = 0;
var featureTable_;
var map;
var geocoder = null;
var polygon;
var map_click_event;
var polygon_area;
var parsedBounds;
var ppe_marker;
var ppe_information;
var ppe_open = false;
var lastMask = 1000;
var ppeOverlay;
var ppe_overlay;
var ppe_layer_visible = true;
var double_click = false;

$(document).ready(function() {

		if ($.browser.msie && $.browser.version.substr(0,1)<7) {
			var Tam = TamVentana();
		  $('#map').css('width',Tam[0]+'px');
		 	$('#map').css('height',Tam[1]+'px');
			$('div.map_carbon_container div.modal').css('width',Tam[0]+'px');
		 	$('div.map_carbon_container div.modal').css('height',Tam[1]+'px');
			window.onresize = function() {
			  var Tam = TamVentana();
			  $('#map').css('width',Tam[0]+'px');
			 	$('#map').css('height',Tam[1]+'px');
				$('div.map_carbon_container div.modal').css('width',Tam[0]+'px');
			 	$('div.map_carbon_container div.modal').css('height',Tam[1]+'px');
			};
		}
		
		
	  $('div.filterButtons div a').click(function(ev){
		  ev.stopPropagation();
		  ev.preventDefault();
		  if ($(this).parent().hasClass('unclicked')){
	      $(this).parent().parent().children('div.list').show();
	      $(this).parent().removeClass('unclicked');
	      $(this).parent().addClass('clicked');                   
		  } else {
		    $(this).parent().parent().children('div.list').fadeOut();
		    $(this).parent().removeClass('clicked');
		    $(this).parent().addClass('unclicked');                                         
		  }
	  });
	
	
		//Layers checkboxes
		$('div.list ul li a').click(function(ev){
			ev.stopPropagation();
			ev.preventDefault();
			if ($(this).parent().hasClass('checked')) {
				$(this).parent().removeClass('checked');
				$(this).parent().addClass('unchecked');		
				getLayerByPosition(this,false);
			} else {
				$(this).parent().removeClass('unchecked');
				$(this).parent().addClass('checked');	
				getLayerByPosition(this,true);
			}
		});
		
		$('div#map_tools span').hover(function(ev){
			$('#area_tooltip').stop().fadeTo('fast',1);
		},function(ev){
			$('#area_tooltip').stop().fadeTo('slow',0);
		});
	
	
		if ($('#search_text').val()!='Search by city, area, ...') {
			$(this).css('color','#666666');
		}
		
		$('div.modal').css('opacity','0.7');
	
    $('#zoom_in').click(function(ev){
			ev.stopPropagation();
			ev.preventDefault();
			map.setZoom(map.getZoom()+1);
		});
		$('#zoom_out').click(function(ev){
			ev.stopPropagation();
			ev.preventDefault();
			map.setZoom(map.getZoom()-1);
		});
		$('#search_text').click(function(ev){
			ev.stopPropagation();
			ev.preventDefault();
			if ($(this).val() == 'Search by city, area, ...') {
				$(this).val('');
				$(this).focus();
				$(this).css('color','#666666');
			}
		});
		
		$('div.map_tools a').click(function(ev){
			ev.stopPropagation();
			ev.preventDefault();
		});
		
});



function initialize() {
  if (GBrowserIsCompatible()) {
    map = new GMap2(document.getElementById("map"));
    map.setCenter(new GLatLng(42.4419, 15.1419), 2);
    map.clearOverlays();
		map.setMapType(G_PHYSICAL_MAP);
		geocoder = new GClientGeocoder();
		ppe_marker= new PPE_Infowindow_v2(new GLatLng(0,0),null);
		
		//wcmc layers
		var copy_wcmc = new GCopyrightCollection("g");
		copy_wcmc.addCopyright(new GCopyright('Carbon',new GLatLngBounds(new GLatLng(-90,-180), new GLatLng(90,180)),0,'2010 UNEP-WCMC'));
		tilelayer = new GTileLayer(copy_wcmc);
		tilelayer.getTileUrl = function(xy,z) { return 'http://downloads.wdpa.org/ArcGIS/rest/services/carbon/Carbon_webmerc_93/MapServer/tile/'+z+'/'+xy.y+'/'+xy.x};
		tilelayer.isPng = function() { return true;};
		tilelayer.getOpacity = function() { return 0.7; }

		ppeOverlay = new GTileLayerOverlay(tilelayer);
		map.addOverlay(ppeOverlay);

		var copy_gbif = new GCopyrightCollection("Â©");
		copy_gbif.addCopyright(new GCopyright(' ',new GLatLngBounds(new GLatLng(-90,-180), new GLatLng(90,180)),0,' '));
		tilelayer_ppe = new GTileLayer(copy_gbif);
		tilelayer_ppe.getTileUrl = function(xy,z) { return 'http://184.73.201.235/blue/'+z+'/'+xy.x+'/'+xy.y; };
		tilelayer_ppe.isPng = function() { return true;};
		tilelayer_ppe.getOpacity = function() { return 1; }

		ppe_overlay = new GTileLayerOverlay(tilelayer_ppe);
		map.addOverlay(ppe_overlay);

		//click map event
		GEvent.addListener(map, "dblclick", function(overlay, latlng) {
			double_click = true;
    });


		//click map event
		GEvent.addListener(map, "click", function(overlay, latlng, overlaylatlng) {
			setTimeout(
				function(ev){
					if (!double_click) {
						if (ppe_layer_visible) {
							if (ppe_open) {
								setTimeout('map.removeOverlay(ppe_marker)',500);
								ppe_open = false;
							} else {
					     	if (latlng!=null && !$('#draw').hasClass('selected')) {
									showLoader();
									checkPointArea(latlng);
								}
							}
						}
					} else {
						setTimeout(function(ev){
							double_click = false;
						},200);
					}
				},200);
			
    });

    select("select");

  }
}


function select(buttonId) {
  document.getElementById("select").className="";
  document.getElementById("draw").className="";
	if (buttonId=='select') {
		if (polygon!=null) {
			polygon.disableEditing();
		}
	}
  document.getElementById(buttonId).className="selected";
}

function stopEditing() {
  select("select");
}

function getColor(named) {
  return COLORS[(colorIndex_++) % COLORS.length][named ? 0 : 1];
}

function startShape() {
  select("draw");
	if (!$('#done').hasClass('disabled')) {
		$('#done').addClass('disabled');
	}
	if (polygon!=null) {
		map.removeOverlay(polygon);
	}
	if (ppe_marker!=null) {
		map.removeOverlay(ppe_marker);
	}
	
	$('strong.area').html('');
	$('strong.carbon').html('');
  var color = getColor(false);
  polygon = new GPolygon([], color, 2, 0.7, color, 0.4);
  startDrawing(polygon, "Shape " + (++shapeCounter_), function() {
	  	var area = polygon.getArea();
			getStaticImage(polygon);
			if ($('#done').hasClass('disabled')) {
				$('#done').removeClass('disabled');
			}
			polygon_area = (Math.floor(area / 10000) / 100).toFixed(0);
			$('strong.area').html('');
			$('strong.carbon').html('');
			$('#loader_image').show();
			getCarbonHeight(polygon);

			$('strong.area').html($().number_format(polygon_area, {numberOfDecimals:0,
			                                                       decimalSeparator: '.',
			                                                       thousandSeparator: ' '}));
			//$('div.modal_window p.area').html(polygon_area);
			getCountry(polygon.getBounds().getCenter());
	  }, color);
}


function startDrawing(poly, name, onUpdate, color) {
  map.addOverlay(polygon);
  polygon.enableDrawing(options);
  polygon.enableEditing({onEvent: "mouseover"});
  polygon.disableEditing({onEvent: "mouseout"});
	
  GEvent.addListener(polygon, "endline", function() {
		select("select");
		GEvent.bind(polygon, "lineupdated", null, onUpdate);
    GEvent.addListener(polygon, "click", function(latlng, index) {
      if (typeof index == "number") {
        polygon.deleteVertex(index);
      }
    });
  });
}



function showAddress(address) {
  if (geocoder) {
    geocoder.getLocations(
      address,
      function(data) {
        if (data.Status.code!=200) {
          $('#not_found').fadeIn();
					$('#not_found').delay(2000).fadeOut();
        } else {
					var bbox = new GLatLngBounds(
								new GLatLng(data.Placemark[0].ExtendedData.LatLonBox.south,
								data.Placemark[0].ExtendedData.LatLonBox.west),
								new GLatLng(data.Placemark[0].ExtendedData.LatLonBox.north,
								data.Placemark[0].ExtendedData.LatLonBox.east));	
          map.setCenter(bbox.getCenter(), map.getBoundsZoomLevel(bbox));
        }
      }
    );
  }
}


function getCarbonHeight(polygon){
	var geojson = polys2geoJson([polygon]);
	var dataObj = {"area":polygon_area,"geojson": geojson}; 
	 
	$.ajax({
      type: 'POST',
  		url: "http://ec2-174-129-149-237.compute-1.amazonaws.com/carbon",	
  		//url: "/carbon",							
  		data: dataObj,
  		cache: false,
			dataType: 'json',
  		success: function(result){
				$('#loader_image').hide();
				$('strong.carbon').html($().number_format(Math.floor(result.sum_Band1), {numberOfDecimals:0,
				                                                       decimalSeparator: '.',
				                                                       thousandSeparator: ' '}));
				getBioPercentage(polygon_area,result.polygon_id);
  		},
    	error:function (xhr, ajaxOptions, thrownError){
				$('#loader_image').hide();
     	}
		});
}


function getBioPercentage(area, pol_id){
	  
	$.ajax({
      type: 'GET',
  		url: "/kba?polygon_id="+pol_id+"&area="+area,	
  		cache: false,
			dataType: 'json',
  		success: function(result){
				$('p.bio strong').text(parseFloat(result.kbaperc).toFixed(2));
  		},
    	error:function (xhr, ajaxOptions, thrownError){
				$('#loader_image').hide();
     	}
		});
}



function polys2geoJson(polygons) {
    var geojson={"type":"MultiPolygon"};
    var polys = [];
    _.each(polygons,function(pol) {
        var poly =[];
        var path=[];
        var numPoints = pol.getVertexCount();
        for(var i=0; i < numPoints; i++) {
            var lat = pol.getVertex(i).lat();
            var lng = pol.getVertex(i).lng();
            path.push([lng,lat]);
        }
        poly.push(path);
        polys.push(poly);
    });
    geojson['coordinates'] = polys;

    return $.toJSON(geojson);
}

function geoJson2Polys(areajson, bounds){
  var coords = areajson.coordinates;
  var polygons = _(coords).reduce([], function(memo_n, n) {
    var polygonpaths = _(n).reduce([], function(memo_o, o) {
      var polygoncords = _(o).reduce([], function(memo_p, p) {
        var mylatlng = new GLatLng(p[1], p[0]);
        if(bounds){
          bounds.extend(mylatlng);
        }
        memo_p.push(mylatlng);
        return memo_p;
      });
      memo_o.push(polygoncords);
      return memo_o;
    });
    var _polygon = new GPolygon(polygonpaths[0],getColor(false),2,0.7,getColor(false),0.4);
    memo_n.push(_polygon);
    return memo_n;
  });
  return polygons;
}



function showModal() {
	if (!$('#done').hasClass('disabled')) {
		GEvent.clearListeners(map, "click");
		var wscr = $('div#map').parent().width();
	  var hscr = $('div#map').parent().height();

	  var mleft = ( wscr - 544 ) / 2;
	  var mtop = ( hscr - 315 ) / 2;

	  $('div.modal_window').css("left", mleft+'px');
		if ($.browser.msie && $.browser.version.substr(0,1)<7) {
			var Tam = TamVentana();
		  $('div.modal_window').css("top", (Tam[1]-315)/2+'px');
		} else {
		  $('div.modal_window').css("top", mtop+'px');
		}
		$('div.modal').fadeIn(100,function(ev){$('div.modal_window').fadeIn(400)});
	}
}

function showLoader() {
		var wscr = $('div#map').parent().width();

	  var mleft = ( wscr - 60 ) / 2;

	  $('div.big_loader').css("left", mleft+'px');
		$('div.big_loader').show();
}

function firstState() {
	if (polygon!=null) {
		map.removeOverlay(polygon);
	}
	GEvent.addListener(map, "click", function(overlay, latlng, overlaylatlng) {
   	if (latlng!=null && !$('#draw').hasClass('selected')) {
			showLoader();
			checkPointArea(latlng);
		}
  });
	$('#done').addClass('disabled');
	$('div.modal_window').fadeOut(300,function(ev){
		$('div.modal').fadeOut(100);
		select('select');
		$('#loader_image').hide();
		$('strong.area').html('');
		$('strong.carbon').html('');
	});
	
}

function getStaticImage(polygon) {
	var markers=[];
  var numPoints = polygon.getVertexCount();
	
	for(var i=0; i < numPoints; i++) {
      var lat = polygon.getVertex(i).lat().toFixed(2);
      var lng = polygon.getVertex(i).lng().toFixed(2);
      markers.push(new GLatLng(lat,lng));
  }

	var polygonEncoder = new PolylineEncoder();
	var finalPolygon = polygonEncoder.dpEncode(markers);
	
	var url = 'http://maps.google.com/maps/api/staticmap?size=115x75&maptype=terrain&key=nokey&sensor=false&path=fillcolor:0xFF6600|color:0xFF6600|weight:1|enc:'+finalPolygon.encodedPoints;
	
	if (url.length<1000) {
		$('div.image img').attr('src',url);
	} else {
		var latlng = polygon.getBounds().getCenter();
		var newUrl = 'http://maps.google.com/maps/api/staticmap?center='+latlng.lat()+','+latlng.lng()+'&size=115x75&maptype=terrain&key=nokey&sensor=false';
		$('div.image img').attr('src',newUrl);
	}
	
}


function getCountry(latlng) {
	if (geocoder) {
    geocoder.getLocations(
      latlng,
      function(result) {
				// if (result.Placemark!=undefined) {
				// 	$('strong.country').text("X% of "+ result.Placemark[0].AddressDetails.Country.CountryName +"'s total carbon");
				// } else {
				// 	$('strong.country').text("X% of this region total carbon");
				// }
      }
    );
  }
}


function checkPointArea(latlng) {
	$.ajax({
    	type: "GET",
    	url: "http://www.protectedplanet.net/api/sites_by_point_with_geom/"+latlng.lng()+"/"+latlng.lat(),
    	data: null,
    	cache: false,
			dataType:'jsonp',
    	success: function(result){
				if (result.length!=0) {
					ppe_information = result;
					if (ppe_marker!=null) {
						map.removeOverlay(ppe_marker);
					}
					ppe_marker = new PPE_Infowindow_v2(latlng,ppe_information[0]);
					map.addOverlay(ppe_marker);
					ppe_open = true;
				}
				$('div.big_loader').hide();
    	},
      error:function (xhr, ajaxOptions, thrownError){
      	alert('CBD' + xhr.status + "\n" + thrownError);
      }
	 });
}


function choosePPEToCalculate() {
	parsedBounds = new GLatLngBounds();
	if (polygon!=null) {
		map.removeOverlay(polygon);
	}
	map.removeOverlay(ppe_marker);
	
	var polygons_ = geoJson2Polys(ppe_information[0].geometry,parsedBounds);
	polygon = polygons_[0];
	map.addOverlay(polygon);
	map.setCenter(parsedBounds.getCenter(),map.getBoundsZoomLevel(parsedBounds));
	polygon.enableEditing();
	makePolygonOperations();
	
	GEvent.bind(polygon, "lineupdated", null, onUpdatePolygon);
  GEvent.addListener(polygon, "click", function(latlng, index) {
    if (typeof index == "number") {
      polygon.deleteVertex(index);
    }
  });
}


function makePolygonOperations() {
	var area = polygon.getArea();
	getStaticImage(polygon);
	if ($('#done').hasClass('disabled')) {
		$('#done').removeClass('disabled');
	}
	$('strong.area').html('');
	$('strong.carbon').html('');
	$('#loader_image').show();
	polygon_area = (Math.floor(area / 10000) / 100).toFixed(0);
	getCarbonHeight(polygon);
	$('strong.area').html($().number_format(polygon_area, {numberOfDecimals:0,
	                                                       decimalSeparator: '.',
	                                                       thousandSeparator: ' '}));
	getCountry(polygon.getBounds().getCenter());
}


function onUpdatePolygon() {
	var area = polygon.getArea();
	getStaticImage(polygon);
	$('#loader_image').show();
	polygon_area = (Math.floor(area / 10000) / 100).toFixed(0);
	getCarbonHeight(polygon);
	$('strong.area').html($().number_format(polygon_area, {numberOfDecimals:0,
	                                                       decimalSeparator: '.',
	                                                       thousandSeparator: ' '}));
	//$('div.modal_window p.area').html(polygon_area);
	getCountry(polygon.getBounds().getCenter());
}


function TamVentana() {
  var Tamanyo = [0, 0];
  if (typeof window.innerWidth != 'undefined')
  {
    Tamanyo = [
        window.innerWidth,
        window.innerHeight
    ];
  }
  else if (typeof document.documentElement != 'undefined'
      && typeof document.documentElement.clientWidth !=
      'undefined' && document.documentElement.clientWidth != 0)
  {
 Tamanyo = [
        document.documentElement.clientWidth,
        document.documentElement.clientHeight
    ];
  }
  else   {
    Tamanyo = [
        document.getElementsByTagName('body')[0].clientWidth,
        document.getElementsByTagName('body')[0].clientHeight
    ];
  }
  return Tamanyo;
}

	$.fn.digits = function(){ 
	    return this.each(function(){ 
	        $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 ") ); 
	    })
	}
	
	
	
	function getLayerByPosition(element,visible) {
		switch ($(element).attr('id')) {
		    case 'protected_layer' : if (visible) {ppe_overlay.show(); ppe_layer_visible = true;} else {ppe_overlay.hide(); ppe_layer_visible = false;};
		      break;
		    case 'carbon_layer': if (visible) {ppeOverlay.show();} else {ppeOverlay.hide();};
		      break;
		  }
	}
	



