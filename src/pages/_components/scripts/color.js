import { interpolateHsl,lch } from "d3";
import { piecewise } from "d3";

export const color = piecewise(interpolateHsl, [
    "#310001",
    "#e60c18",
    "#f4f135",
    "#18bd00"
  ]);

 export const lighten=(color) =>{
    const c = lch(color);
    c.opacity=0.2
    return c;
  }

  export const colorr=({m,node,question})=>{
    let life,qp
    if(m){
      if(m.type==="réponse"){
        if(question){
          console.log(question)
          qp=question.questionsParticipation
          console.log(qp)
          life = question.answers.find(r=>r.id===m.id).answered
          if(!life)life=0
          console.log(life)
          return !qp?"blue":color(life/qp)
        }
        else {
          console.log('pb de couleur')
          return color(10)}
      }
      else{
        return m.approbation?color(m.approbation/100):color(1)
      }
    }
    if(node){
      return color(node.data.a/100)
    }

  }