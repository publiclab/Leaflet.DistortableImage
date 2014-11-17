var clicked = false;

function outline(){
  clicked = !clicked;
  if (clicked) {
    newimg.setOpacity(0.2);
    $('.imgdistort').css('border','2px solid black');
  } else {
    newimg.setOpacity(1);;
    $('.imgdistort').css('border', '');
  }
};
