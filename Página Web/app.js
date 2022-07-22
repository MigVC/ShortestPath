//Dark mode
let day = true;
const Pagina = document.querySelector("html");
const Interruptor = document.querySelector(".interruptor");
Interruptor.addEventListener("click",function(){
  if(day){
    Pagina.style.setProperty("--primario","rgb(23, 23, 24)");
    Pagina.style.setProperty("--secundario", "rgb(45, 45, 49)")
    Pagina.style.setProperty("--tercero", "rgb(23, 23, 24)")
    Pagina.style.setProperty("--letras","white");
    Interruptor.style.left = "20px";
  }else{
    Pagina.style.setProperty("--primario","rgb(145, 146, 238)");
    Pagina.style.setProperty("--secundario","rgb(194, 194, 206)")
    Pagina.style.setProperty("--tercero", "rgb(139, 141, 218)")
    Pagina.style.setProperty("--letras","black");
    Interruptor.style.left = "0";
  }
  day = !day;
});




/************************************************************************
                     FUNCIONES ALGORITMO
*************************************************************************/
//Dijkstra algorithm is used to find the shortest distance between two nodes inside a valid weighted graph. 
//Often used in Google Maps, Network Router etc.

//helper class for PriorityQueue
class Node {
  constructor(val, priority) {
     this.val = val;
    this.priority = priority;
  }
}
  
class PriorityQueue {
  constructor() {
    this.values = [];
  }
  enqueue(val, priority) {
    let newNode = new Node(val, priority);
    this.values.push(newNode);
    this.bubbleUp();
  }
  bubbleUp() {
    let idx = this.values.length - 1;
    const element = this.values[idx];
    while (idx > 0) {
      let parentIdx = Math.floor((idx - 1) / 2);
      let parent = this.values[parentIdx];
      if (element.priority >= parent.priority) break;
      this.values[parentIdx] = element;
      this.values[idx] = parent;
      idx = parentIdx;
    }
  }
  dequeue() {
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0) {
      this.values[0] = end;
      this.sinkDown();
    }
    return min;
  }
  sinkDown() {
    let idx = 0;
    const length = this.values.length;
    const element = this.values[0];
    while (true) {
      let leftChildIdx = 2 * idx + 1;
      let rightChildIdx = 2 * idx + 2;
      let leftChild, rightChild;
      let swap = null;
  
      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx];
        if (leftChild.priority < element.priority) {
          swap = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIdx;
        }
      }
      if (swap === null) break;
      this.values[idx] = this.values[swap];
      this.values[swap] = element;
      idx = swap;
    }
  }
}
  
//Dijkstra's algorithm only works on a weighted graph.
  
class WeightedGraph {
  constructor() {
    this.adjacencyList = {};
  }
  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
  }
  addEdge(vertex1, vertex2, weight) {
    this.adjacencyList[vertex1].push({ node: vertex2, weight });
    this.adjacencyList[vertex2].push({ node: vertex1, weight });
  }
  getAL(vertex){
    return this.adjacencyList[vertex];
  }
  DLS(vertexI, listOp, maxDepth){
    if(listOp.includes(vertexI)) return [vertexI, true];
    if(maxDepth<=0) return [null, false];
    let listAd = this.getAL(vertexI);
    for(let i=0 ; i<listAd.length ; i++){
      let temp = this.DLS(listAd[i].node, listOp, maxDepth-1);
      if(temp[1]) return temp;
    }
    return [null, false];
  }
  IDDFS(vertexI, listOp, maxDepth){
    for(let j=0 ; j<maxDepth ; j++){
      let temp = this.DLS(vertexI, listOp, j)
      if(temp[1]) return temp;
    }
    return [null,false];
  }
  Dijkstra(start, finish) {
    const nodes = new PriorityQueue();
    const distances = {};
    const previous = {};
    let total = 0;
    let path = []; //to return at end
    let smallest;
    //build up initial state
    for (let vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0;
        nodes.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
        nodes.enqueue(vertex, Infinity);
      }
      previous[vertex] = null;
    }
    // as long as there is something to visit
    while (nodes.values.length) {
      smallest = nodes.dequeue().val;
      if (smallest === finish) {
        //WE ARE DONE
        //BUILD UP PATH TO RETURN AT END
        while (previous[smallest]) {
          path.push(smallest);
          smallest = previous[smallest];
          //console.log(distances[smallest]);
        }
        total = distances[path[0]];
        break;

      }
      if (smallest || distances[smallest] !== Infinity) {
        for (let neighbor in this.adjacencyList[smallest]) {
          //find neighboring node
          let nextNode = this.adjacencyList[smallest][neighbor];
          //calculate new distance to neighboring node
          let candidate = distances[smallest] + nextNode.weight;
          let nextNeighbor = nextNode.node;
          if (candidate < distances[nextNeighbor]) {
            //updating new smallest distance to neighbor
            distances[nextNeighbor] = candidate;
            //updating previous - How we got to neighbor
            previous[nextNeighbor] = smallest;
            //enqueue in priority queue with new priority
            nodes.enqueue(nextNeighbor, candidate);
          }
        }
      }
    }
    return [path.concat(smallest).reverse(), total];
  }
}

/************************************************************************
                      FUNCIONES PAGINA WEB
**************************************************************************/
// canvas del mapa con nodos
var canvas = document.getElementById("canvas");

function getElementPosition(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function getEventLocation(element,event){
    var pos = getElementPosition(element); 
    return {
        x: (event.pageX - pos.x),
        y: (event.pageY - pos.y)
    };
}

// dibujar imagen dentro del canvas
function drawImageFromWebUrl(sourceurl){
    var img = new Image();
    img.addEventListener("load", function () {
        canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);        
    });
    img.setAttribute("src", sourceurl);
}

//dibujar lineas dentro del canvas
function dibujarLineas(sourceurl, hosp) {
  var img = new Image();
  var camino = hosp[0];
  img.addEventListener("load", function () {
    lapiz = canvas.getContext("2d");
    lapiz.beginPath();
    lapiz.strokeStyle = '#24CEDD';
    let posNodo = NodosIntID.indexOf(camino[0]);
    lapiz.moveTo(NodosInt[posNodo].posX*1583/905, NodosInt[posNodo].posY*1583/905)
    for(let i = 1 ; i < camino.length-1 ; i++){
      let posNodo = NodosIntID.indexOf(camino[i]);
      lapiz.lineTo(NodosInt[posNodo].posX*1583/905, NodosInt[posNodo].posY*1583/905);
    }
    let posHops = hospitalesID.indexOf(camino[camino.length-1]);
    lapiz.lineTo(hospitales[posHops].posX*1583/905, hospitales[posHops].posY*1583/905);
    lapiz.lineWidth = 15;
    lapiz.stroke();
    /*lapiz.moveTo(21*1583/905, 84*1583/905);
    lapiz.lineTo(500, 500);
    lapiz.lineWidth = 10;
    lapiz.stroke();*/
  })
  img.setAttribute("src", sourceurl);
}

/************ DATOS ************/

// Datos grafo
var graph = new WeightedGraph();
graph.addVertex("H1"); graph.addVertex("H2"); graph.addVertex("H3"); graph.addVertex("H4");
graph.addVertex("H5"); graph.addVertex("H6"); graph.addVertex("H7"); 

graph.addVertex("n1"); graph.addVertex("n2"); graph.addVertex("n3"); graph.addVertex("n4");
graph.addVertex("n5"); graph.addVertex("n6"); graph.addVertex("n7"); graph.addVertex("n8");
graph.addVertex("n9"); graph.addVertex("n10"); graph.addVertex("n11"); graph.addVertex("n12");
graph.addVertex("n13");graph.addVertex("n14");;graph.addVertex("n15"); graph.addVertex("n16");
graph.addVertex("n17"); graph.addVertex("n18"); graph.addVertex("n19");

graph.addEdge("H1", "n1", 3); graph.addEdge("H1", "n7", 5); graph.addEdge("n1", "H2", 2);
graph.addEdge("n1", "n2", 2); graph.addEdge("n2", "H2", 2); graph.addEdge("n2", "n5", 3);
graph.addEdge("n2", "n3", 3); graph.addEdge("n3", "n4", 2); graph.addEdge("H2", "n7", 6);
graph.addEdge("H2", "n6", 3); graph.addEdge("n4", "n5", 6); graph.addEdge("n4", "n9", 5);
graph.addEdge("n4", "n10", 7); graph.addEdge("n5", "n9", 2); graph.addEdge("n5", "n6", 2);
graph.addEdge("n6", "n11", 3); graph.addEdge("n6", "n8", 3); graph.addEdge("n6", "n7", 7);
graph.addEdge("n7", "n12", 2); graph.addEdge("n9", "n10", 2); graph.addEdge("n8", "n11", 2);
graph.addEdge("n10", "H3", 2); graph.addEdge("n10", "n11", 2); graph.addEdge("n11", "n15", 4);
graph.addEdge("n11", "H3", 4); graph.addEdge("n11", "n12", 3); graph.addEdge("n12", "n14", 5);
graph.addEdge("n12", "n13", 4); graph.addEdge("n3", "n4", 2); graph.addEdge("H3", "n16", 4);
graph.addEdge("H3", "n15", 6); graph.addEdge("n16", "H4", 3); graph.addEdge("n16", "n17", 1);
graph.addEdge("n17", "n15", 2); graph.addEdge("n15", "n18", 2); graph.addEdge("n15", "n14", 2);
graph.addEdge("n14", "n18", 2); graph.addEdge("n14", "n13", 2); graph.addEdge("n13", "n19", 2);
graph.addEdge("n13", "H7", 3); graph.addEdge("n18", "H4", 1); graph.addEdge("n18", "n19", 1);
graph.addEdge("n19", "H5", 3); graph.addEdge("n19", "H6", 4); graph.addEdge("n19", "H7", 2);
graph.addEdge("H4", "H5", 2); graph.addEdge("H5", "H6", 2); graph.addEdge("H6", "H7", 3);

// Datos: Hospitales
const hospitalesID = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'];
const hospitales = [
  {
    id: 'H1', nombre: 'Clinica Pardo',
    direccion: 'Av. de La Cultura 710',
    posX: 81, posY: 36, radioB: 20,
    datoRef: 'http://www.clinicapardo.com.pe/'
  },
  {
    id: 'H2', nombre: 'Hospital de la solidaridad',
    direccion: 'Calle Micaela Bastidas s/n',
    posX: 96, posY: 77, radioB: 20,
    datoRef: 'http://www.sisol.gob.pe/'
  },
  {
    id: 'H3', nombre: 'HN "Adolfo Guevara Velasco"',
    direccion: 'F2FQ+WP4, Cusco 08002',
    posX: 502, posY: 288, radioB: 55,
    datoRef: 'http://www.essalud.gob.pe/hospital-nacional-adolfo-guevara-velasco-del-cusco-celebra-29-anos-de-creacion/'
  },
  {
    id: 'H4', nombre: 'Clinica Espinar',
    direccion: 'Av. los Incas 1403, Cusco 08002',
    posX: 767, posY: 260, radioB: 20,
    datoRef: ''
  },
  {
    id: 'H5', nombre: 'Clínica Macsalud',
    direccion: 'F2GV+3V, 3S 1410, Cusco 08200',
    posX: 816, posY: 242, radioB: 20,
    datoRef: 'https://www.macsalud.com/'
  },
  {
    id: 'H', nombre: 'Hospital Regional',
    direccion: 'F2GW+F39, Cusco 08003',
    posX: 854, posY: 174, radioB: 32,
    datoRef: ''
  },
  {
    id: 'H7', nombre: 'Direccion de Salud Cuzco',
    direccion: 'Av. de la Cultura, Cusco 08003',
    posX: 789, posY: 141, radioB: 35,
    datoRef: ''
  },
];

// Datos: Nodos intermedios (intersecciones, avenidas, sitios clave)
const NodosIntID = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12', 
                    'n13', 'n14', 'n15', 'n16', 'n17', 'n18', 'n19'];
const NodosInt = [
  {
    id: 'n1', nombre: 'Plaza Túpac Amaru',
    direccion: 'F2GM+X85, Cusco 08002',
    posX: 21, posY: 84, radioB: 25
  },
  {
    id: 'n2', nombre: 'Templo de Santa María de los Andes',
    direccion: 'F2GM+HGJ, Cusco 08002',
    posX: 46, posY: 150, radioB: 40
  },
  {
    id: 'n3', nombre: 'Estadio Inca Garcilaso de la Vega',
    direccion: 'F2FM+WC7, Cusco 08002',
    posX: 37, posY: 271, radioB: 60
  },
  {
    id: 'n4', nombre: 'Travel Peru Tour',
    direccion: 'Urb. 4 Torres Calle Ramon Castilla 823',
    posX: 159, posY: 317, radioB: 45
  },
  {
    id: 'n5', nombre: 'SERV CUSCO',
    direccion: 'Av. Huayruropata',
    posX: 201, posY: 219, radioB: 40
  },
  {
    id: 'n6', nombre: 'Ministerio de Trabajo',
    direccion: 'Micaela Bastidas 301',
    posX: 238, posY: 120, radioB: 42
  },
  {
    id: 'n7', nombre: 'Parque Mariscal Gamarra',
    direccion: 'Cusco 08003',
    posX: 294, posY: 46, radioB: 38
  },
  {
    id: 'n8', nombre: 'Corrales',
    direccion: 'F2GQ+P65, Cusco 08002',
    posX: 350, posY: 122, radioB: 35
  },
  {
    id: 'n9', nombre: 'Colegio María de la Merced',
    direccion: 'Av. Tomasa Ttito Condemayta',
    posX: 304, posY: 262, radioB: 50
  },
  {
    id: 'n10', nombre: 'Agente Banco de la Nación',
    direccion: 'Av, Anselmo Alvarez N° 440',
    posX: 398, posY: 301, radioB: 40
  },
  {
    id: 'n11', nombre: 'Prima AFP',
    direccion: 'Micaela Bastidas 505',
    posX: 404, posY: 178, radioB: 35
  },
  {
    id: 'n12', nombre: 'Parque Infantil de MG',
    direccion: 'Retamas, Cusco 08003',
    posX: 404, posY: 77, radioB: 20
  },
  {
    id: 'n13', nombre: 'UNSAAC',
    direccion: 'Av. de La Cultura 773',
    posX: 614, posY: 114, radioB: 50
  },
  {
    id: 'n14', nombre: 'Cevicheria Asu Mare!',
    direccion: 'Av. los Incas 1034',
    posX: 557, posY: 191, radioB: 35
  },
  {
    id: 'n15', nombre: 'Oficina de Normalización Previsional',
    direccion: 'Micaela Bastidas 709',
    posX: 594, posY: 248, radioB: 22
  },
  {
    id: 'n16', nombre: 'Coliseo Cerrado',
    direccion: 'Ccoriwaylla Gutierrez, Cusco 08002',
    posX: 682, posY: 336, radioB: 25
  },
  {
    id: 'n17', nombre: 'Kijllu Restaurante Cevicheria',
    direccion: 'Micaela Bastidas 727',
    posX: 673, posY: 282, radioB: 18
  },
  {
    id: 'n18', nombre: 'Restauran la. NorteñotA',
    direccion: 'Av. los Incas, Cusco 08002',
    posX: 688, posY: 240, radioB: 15
  },
  {
    id: 'n19', nombre: 'Colegio Médico del Perú',
    direccion: 'Victor Raul Haya De La Torre',
    posX: 699, posY: 189, radioB: 32
  }
];

/*** Loop Principal ***/

// dibujamos el mapa con nodos
drawImageFromWebUrl("MapaNodos.png");
// segun el click dado ejecutar algoritmo
canvas.addEventListener("click", function(e){
  drawImageFromWebUrl("MapaNodos.png");
    var eventLocation = getEventLocation(this,e);
    // recuperamos la posicion del evento
    let posXe = eventLocation.x;
    let posYe = eventLocation.y;
    // iniciamos el punto inicial
    let puntoI = '';
    // recorremos todos los hospitales
    for(let i = 0 ; i < hospitales.length ; i++)
    {
      // recuperamos la pos del hospital i
      posXH = hospitales[i].posX;
      posYH = hospitales[i].posY;
      radioH = hospitales[i].radioB; // radio de busqueda del click
      // determinamos a que distancia del centro del hospital
      // se hizo click
      let d = Math.pow(posXe-posXH,2) + Math.pow(posYe-posYH,2);
      d = Math.sqrt(d);
      if(d<=radioH) // si esta dentro del radio de busqueda
      {
        puntoI = hospitales[i].id; // id del hospital (Hi)
        // Mostrar datos en index.html
        // Punto inicio
        var txtPuntoInicio = document.getElementById('puntoInicio');
        txtPuntoInicio.innerHTML = hospitales[i].nombre;
        // Punto final: Hospital mas cercano
        var txtPuntoFinal = document.getElementById('puntoFinal')
        txtPuntoFinal.innerHTML = "Se encuentra en un hospital";
        // Direccion electronica
        var urlH = document.getElementById('url');
        urlH.href = hospitales[i].datoRef;
        /*var nuevo_a = document.createElement('a');
        nuevo_a.className = 'text-reset fw-bold';
        nuevo_a.href = hospitales[i].datoRef;
        nuevo_a.appendChild(document.createTextNode('AntiClick here'));
        urlH.appendChild(nuevo_a);*/
        // Direccion
        var txtDireccion = document.getElementById('direccion')
        txtDireccion.innerHTML = hospitales[i].direccion;
        // Tiempo de llegada
        var txtTiempo = document.getElementById('tiempo')
        txtTiempo.innerHTML = "0 segundos";
        break;
      }
    }
    if(puntoI==='') // el punto inicial es un nodo intermedio
    {
      // recorremos los nodos intermedios
      for(let j=0 ; j<NodosInt.length ; j++)
      {
        // recuperamos la pos del nodo j
        posXH = NodosInt[j].posX;
        posYH = NodosInt[j].posY;
        radioN = NodosInt[j].radioB; // radio de busqueda del click
        // determinamos a que distancia del centro del hospital
        // se hizo click
        let d = Math.pow(posXe-posXH,2) + Math.pow(posYe-posYH,2);
        d = Math.sqrt(d);
        if(d<=radioN) // si esta dentro del radio de busqueda
        {
          puntoI = NodosInt[j].id; // id del hospital (nj)
          // Mostrar datos en index.html
          // Punto inicio
          var txtPuntoInicio = document.getElementById('puntoInicio');
          txtPuntoInicio.innerHTML = NodosInt[j].nombre;
          break;
        }
      }
      if(puntoI!='')
      {
        // primer hospital mas cercano
        let temp1 = graph.IDDFS(puntoI,hospitalesID,25);
        let posFH = hospitalesID.indexOf(temp1[0]); // pos dentro hospitalesID
        // copia temp de HospitalesID
        var hospTemp = hospitalesID.slice();
        hospTemp.splice(posFH, 1); // elimina el primer hospital
        // segundo hospital mas cercano
        let temp2 = graph.IDDFS(puntoI,hospTemp,25);
        let posSH = hospitalesID.indexOf(temp2[0]);
        // 2 caminos de costo minimo
        let costFH = graph.Dijkstra(puntoI, temp1[0]);
        let costSH = graph.Dijkstra(puntoI, temp2[0]);
        let sol;
        // mejor camino de costo minimo
        if(costFH[1] > costSH[1]) sol = costSH;
        else sol = costFH;
        // obtener objeto mejor hospital
        let idMejorHosp = sol[0][sol[0].length-1];
        let posMejorHosp = hospitalesID.indexOf(idMejorHosp);
        // Mostrar datos del hospital mas cercano al punto inicial
        var txtPuntoFinal = document.getElementById('puntoFinal')
        txtPuntoFinal.innerHTML = hospitales[posMejorHosp].nombre;
        // Direccion electronica
        //var urlH = document.getElementById('urlHospital');
        // Direccion electronica
        var urlH = document.getElementById('url');
        urlH.href = hospitales[posMejorHosp].datoRef;
        /*var nuevo_a = document.createElement('a');
        nuevo_a.className = 'text-reset fw-bold';
        nuevo_a.href = hospitales[posMejorHosp].datoRef;
        nuevo_a.appendChild(document.createTextNode('AntiClick here'));
        urlH.appendChild(nuevo_a);*/
        // Direccion
        var txtDireccion = document.getElementById('direccion')
        txtDireccion.innerHTML = hospitales[posMejorHosp].direccion;
        // Tiempo de llegada
        var txtTiempo = document.getElementById('tiempo')
        txtTiempo.innerHTML = sol[1] + " minutos";
        dibujarLineas("MapaNodos.png", sol);
      }
    }
},false);


/* Referencias adicionales
https://www.w3schools.com/tags/canvas_linewidth.asp
https://www.youtube.com/watch?v=rsMaXyss06Y
https://parzibyte.me/blog/2019/07/16/dibujar-lineas-canvas-javascript-html5/
https://www.geeksforgeeks.org/iterative-deepening-searchids-iterative-deepening-depth-first-searchiddfs/
https://www.geeksforgeeks.org/iterative-depth-first-traversal/
*/