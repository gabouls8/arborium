if (!Math.sign) Math.sign = function(x) { return ((x > 0) - (x < 0)) || +x; };

export default function (halfwidth,aboveGndHeight) {

    let nodes,
      strength,
      strengths;
  
    function force () {
      let maxWidth,maxHeight,node
      //console.log(halfwidth,aboveGndHeight)
      for (let i=0; i<nodes.length; i++) {
        node = nodes[i];
        if(!maxWidth)maxWidth=Math.abs(node.x)
        else if (Math.abs(node.x)>maxWidth)maxWidth=Math.abs(node.x)
        if(!maxHeight)maxHeight=Math.abs(node.y)
        else if (Math.abs(node.y)>maxHeight)maxHeight=Math.abs(node.y)
      }
      const ratioWidth = halfwidth/maxWidth
      const ratioHeight = aboveGndHeight/maxHeight
      const zoomRatio = Math.min(ratioWidth,ratioHeight)
//console.log(zoomRatio)
      for (let i=0; i<nodes.length; i++) {
        node = nodes[i];
        node.x = node.x*zoomRatio;
        node.y= node.y*zoomRatio;
        node.vx = node.vx*zoomRatio;
        node.vy = node.vy*zoomRatio;
        node.rayon=node.rayon*zoomRatio
        node.width=node.width*zoomRatio
        node.desiredLength=node.desiredLength*zoomRatio
        //console.log(node.desiredLength)
      }
    }
  
    function initialize () {
      if (!nodes) return;
  
      // populate local `strengths` using `strength` accessor
      strengths = new Array(nodes.length);
      for (let i=0; i<nodes.length; i++) strengths[i] = strength(nodes[i], i, nodes);
  
    }
  
    force.initialize = _ => {
      nodes = _;
      initialize();
    };
  
    force.strength = _ => {
      // return existing value if no value passed
      if (_ == null) return strength;
  
      // coerce `strength` accessor into a function
      strength = typeof _ === 'function' ? _ : () => +_;
  
      // reinitialize
      initialize();
  
      // allow chaining
      return force;
    };
  
  
    if (!strength) force.strength(0.1);
  
    return force;
  
  }