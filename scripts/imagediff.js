//based on http://pastebin.com/cWxA6EDR

  function diff() {
    var c1=document.getElementById("canvas1");
    var ctx1=c1.getContext("2d");
    var img1=new Image();
    img1.src = 'images/'+currentFrame+'.png';
    ctx1.drawImage(img1,0,0);
    var imageData1 = ctx1.getImageData(0, 0, c1.width, c1.height);
    var data1 = imageData1.data;
    
    var c2=document.getElementById("canvas2");
    var ctx2=c2.getContext("2d");
    var img2=new Image();
    var nextframe = currentFrame+1;
    img2.src='images/' + nextframe + '.png';
    ctx2.drawImage(img2,0,0);
    var data2 = ctx2.getImageData(0, 0, c2.width, c2.height).data;
    
    var c3=document.getElementById("canvas3");
    var ctx3=c3.getContext("2d");
    var imageData = ctx3.getImageData(0, 0, c3.width, c3.height);
    var data3 = imageData.data;
    for(var i = 0, n = data1.length; i < n; i += 4) {
      var color1 = data1[i];
      
      var color2 = data2[i];
      
      data3[i] = color1==color2?color1:(color1<color2?0xFF:0x00);
      data3[i+1] = color1==color2?color1:(color1>color2?0xFF:0x00);
      data3[i+2] = color1==color2?color1:0x00;
      data3[i+3] = 0xFF;
    }
    
    ctx3.putImageData(imageData, 0, 0);
  }