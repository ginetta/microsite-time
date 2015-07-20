var timeToColor, zeroPad, interval, $body = $('body'), $clock, start, $color, setNight, isNight, nightStart, nightStop, $ginLogo, $w, setTimeFromSunriseData;

$clock = $("strong em").eq(0);
$color = $("span").eq(0);
$ginLogo = $("svg g");
$w = $(window);

zeroPad = function(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};

timeToColor = function( secondProgress,add ){
  add = add || 0;
  return $.huslp.toHex( Math.floor( (secondProgress * 360 ) + add) % 360,100,75 );
};

isNight = false;
nightStart = moment('19:00','HH:mm');
nightStop = moment('8:00','HH:mm');

setTimeFromSunriseData = function(data) {
  nightStart = moment(data.results['astronomical_twilight_end']);
  nightStop = moment(data.results['civil_twilight_begin']);
  var time = new Date();
  setNight(time);
}

$.get('http://api.sunrise-sunset.org/json?lat=47.3744367&lng=8.528176499999999&date=today&formatted=0', function(data){
  if('results' in data) {
    setTimeFromSunriseData(data);
  }
});

if(navigator.geolocation){
  navigator.geolocation.getCurrentPosition(function(position){
    $.get('http://api.sunrise-sunset.org/json?lat=' + position.coords.latitude + '&lng=' + position.coords.longitude + '&date=today&formatted=0', function(data){
      if('results' in data) {
        setTimeFromSunriseData(data);
      }
    });
  });
}

setNight = function(t){
  t = moment(t);
  if( (t.isAfter(nightStart) || t.isBefore(nightStop)) && !isNight ){
    $body.addClass('night');
    $body.css({
      "background": "none"
    });
    isNight = true;
  } else if (isNight && !(t.isAfter(nightStart) || t.isBefore(nightStop))) {
    $body.removeClass('night').css("color", "#181818");
    $ginLogo.attr("fill", "#181818");
    isNight = false;
  }
};

ticktack.on('tick', function(o){
  var color, color2, time = new Date();
  color = timeToColor( o.getMinute().progress );
  color2 = timeToColor( o.getMinute().progress, 18 );

  if(isNight){
    $body.css("color", color);
    $ginLogo.attr("fill", color);
  }else{
    $body.css({
      "background-color": color,
      "background-image": "linear-gradient(180deg," + color + ", " + color2 + ")"
    });
  }

  $clock.text( zeroPad(o.getHour().value,2) + " " + zeroPad(o.getMinute().value,2) + " " + zeroPad(o.getSecond().value,2) );

  $color.text( color );
});

ticktack.on('minute', function(){
  var time = new Date();
  setNight(time);
});
