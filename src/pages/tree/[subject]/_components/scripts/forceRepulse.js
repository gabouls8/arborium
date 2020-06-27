
export default function () {

    let nodes,
      strength,
      strengths;
  
    function force (alpha) {
      let node, strength;
      for (let i=0; i<nodes.length; i++) {
        node = nodes[i];
        strength = strengths[i];
        node.vx += node.x/(node.x**2+node.y**2)**0.5 * strength * alpha;
        node.vy += node.y/(node.x**2+node.y**2)**0.5 * strength * alpha;
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