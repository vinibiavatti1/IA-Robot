/**
 * Globais
 */
var matriz = [[]];
var ferramentas = {
    parede: 0,
    robo: 1,
    ponteiro: 2,
    alvo: 3
}
var objetos = {
    parede: 1,
    robo: 2,
    nada: 0,
    alvo: 3,
    caminho: 4
}
var largura = 20;
var altura = 10;
var ferramenta = ferramentas.parede;
var robo = {
    x: null,
    y: null
}
var simulacao = false;
var diagonal = false;
var zoom = 20;

/**
 * Init
 */
$(document).ready(function() {
    criarMatriz();
    desenharTabuleiro();
});

/**
 * Criar mapa
 */
function novo() {
    if(confirm("Deseja iniciar uma nova simulação?")) {
        _largura = prompt("informe a largura do mapa (min: 5, max: 200):");
        _altura = prompt("informe a altura do mapa (min: 5, max: 200):");
        if(isNaN(_largura) || parseInt(_largura) < 5 || parseInt(_largura) > 200) {
            _largura = 20;
        }
        if(isNaN(_altura)  || parseInt(_altura) < 5 || parseInt(_altura) > 200) {
            _altura = 10;
        }
        largura = _largura;
        altura = _altura;
        criarMatriz();
        desenharTabuleiro();
        selecionarFerramenta(ferramentas.ponteiro);
    }
}

/**
 * Iniciar simulação
 */
function iniciarSimulacao() {
    if(!existeObjeto(objetos.robo)) {
        alert("Para iniciar a simulação, adicione o robô no tabuleiro.");
        return;
    }
    if(!existeObjeto(objetos.alvo)) {
        alert("Para iniciar a simulação, adicione um alvo no tabuleiro.");
        return;
    }
    console.log("Simulação iniciada.");
    posicao = busca();
    if(!posicao) {
        alert("Não foram encontrados caminhos possíveis até o alvo.");
        return;
    }
    simulacao = true;
    solucao = [];
    var primeiro = true;
    while(posicao != null) {
        if(posicao.pai != null && !primeiro) {
            matriz[posicao.y][posicao.x] = objetos.caminho;
        }
        primeiro = false;
        console.log(posicao.x + " - " + posicao.y);
        solucao.push(posicao);
        posicao = posicao.pai;
    }
    solucao = solucao.reverse();
    var i = 0;
    desenharTabuleiro();
    var intervalo = setInterval(function() {
        if(!solucao[i]) {
            clearInterval(intervalo);
            console.log("Simulação finalizada.");
            simulacao = false;
            return;
        }
        removerObjetos(objetos.robo);
        matriz[solucao[i].y][solucao[i].x] = objetos.robo;
        robo = {
            x: solucao[i].x,
            y: solucao[i].y
        }
        desenharTabuleiro();
        i++;
    }, 200);
}

/**
 * Método de busca em largura
 */
function busca() {
    var _matriz = [];
    for(var i = 0; i < matriz.length; i++) {
        _matriz[i] = matriz[i].slice(0);
    }
    
    pilha = [{
        x: robo.x,
        y: robo.y,
        pai: null
    }];
    
    while(pilha.length > 0) {
        var posicao = pilha.shift();
        if(_matriz[posicao.y][posicao.x] == objetos.alvo) {
            return posicao;
        }

        var objeto = _matriz[posicao.y][posicao.x - 1];
        if(objeto != objetos.parede) {
            pilha.push({
                x: posicao.x - 1,
                y: posicao.y,
                pai: posicao
            });
        }

        objeto = _matriz[posicao.y -1][posicao.x]
        if(objeto != objetos.parede) {
            pilha.push({
                x: posicao.x,
                y: posicao.y - 1,
                pai: posicao
            });
        }

        objeto = _matriz[posicao.y][posicao.x + 1]
        if(objeto != objetos.parede) {
            pilha.push({
                x: posicao.x + 1,
                y: posicao.y,
                pai: posicao
            });
        }

        objeto = _matriz[posicao.y + 1][posicao.x]
        if(objeto != objetos.parede) {
            pilha.push({
                x: posicao.x,
                y: posicao.y + 1,
                pai: posicao
            });
        }

        if(diagonal) {
            objeto = _matriz[posicao.y - 1][posicao.x - 1];
            if(objeto != objetos.parede) {
                pilha.push({
                    x: posicao.x - 1,
                    y: posicao.y - 1,
                    pai: posicao
                });
            }

            objeto = _matriz[posicao.y - 1][posicao.x + 1]
            if(objeto != objetos.parede) {
                pilha.push({
                    x: posicao.x + 1,
                    y: posicao.y - 1,
                    pai: posicao
                });
            }

            objeto = _matriz[posicao.y + 1][posicao.x - 1]
            if(objeto != objetos.parede) {
                pilha.push({
                    x: posicao.x - 1,
                    y: posicao.y + 1,
                    pai: posicao
                });
            }

            objeto = _matriz[posicao.y + 1][posicao.x + 1]
            if(objeto != objetos.parede) {
                pilha.push({
                    x: posicao.x + 1,
                    y: posicao.y + 1,
                    pai: posicao
                });
            }
        }

        _matriz[posicao.y][posicao.x] = objetos.parede;
    }
    return false;
}

/**
 * Criar matriz de mapa
 */
function criarMatriz() {
    for(var i = 0; i < altura; i++) {
        matriz[i] = [];
        for(var j = 0; j < largura; j++) {
            if(i == 0 || j == 0 || j == largura - 1 || i == altura - 1) {
                matriz[i][j] = objetos.parede;
            } else {
                matriz[i][j] = objetos.nada;
            }
        }
    }
}

/**
 * Desenhar tabuleiro
 * @param {*} largura 
 * @param {*} altura 
 */
function desenharTabuleiro() {
    $("#tabuleiro tbody").empty();
    var estilo = `style='padding: ${zoom}px'`;
    var html = "";
    for(var i = 0; i < altura; i++) {
        html += "<tr>";
        for(var j = 0; j < largura; j++) {
            if(matriz[i][j] == objetos.parede) {
                html += `<td class='quadrante parede' ${estilo} onclick='selecionarQuadrante(${j},${i})'></td>`;
            } else if (matriz[i][j] == objetos.nada) {
                html += `<td class='quadrante' ${estilo} onclick='selecionarQuadrante(${j},${i})'></td>`;
            } else if (matriz[i][j] == objetos.robo) {
                html += `<td class='quadrante robo' ${estilo} onclick='selecionarQuadrante(${j},${i})'></td>`;
            } else if (matriz[i][j] == objetos.alvo) {
                html += `<td class='quadrante alvo' ${estilo} onclick='selecionarQuadrante(${j},${i})'></td>`;
            } else if (matriz[i][j] == objetos.caminho) {
                html += `<td class='quadrante caminho' ${estilo}></td>`;
            }
        }
        html += "</tr>";
    }
    $("#tabuleiro tbody").append(html);
}

/**
 * Selecionar ferramenta
 * @param {*} _ferramenta 
 */
function selecionarFerramenta(_ferramenta) {
    if(simulacao) return;
    ferramenta = _ferramenta;
    $("#botao-ponteiro").removeClass("botao-selecionado");
    $("#botao-alvo").removeClass("botao-selecionado");
    $("#botao-robo").removeClass("botao-selecionado");
    $("#botao-parede").removeClass("botao-selecionado");
    if(_ferramenta == ferramentas.ponteiro) {
        $("#botao-ponteiro").addClass("botao-selecionado");
    }
    if(_ferramenta == ferramentas.alvo) {
        $("#botao-alvo").addClass("botao-selecionado");
    }
    if(_ferramenta == ferramentas.robo) {
        $("#botao-robo").addClass("botao-selecionado");
    }
    if(_ferramenta == ferramentas.parede) {
        $("#botao-parede").addClass("botao-selecionado");
    }
}

/**
 * Selecionar quadrante
 * @param {*} j 
 * @param {*} i 
 */
function selecionarQuadrante(j, i) {
    if(simulacao) return;
    if(i == 0 || j == 0 || j == largura - 1 || i == altura - 1) {
        return;
    }
    if(ferramenta == ferramentas.parede) {
        if(matriz[i][j] == objetos.nada) {
            matriz[i][j] = objetos.parede;
        } else if(matriz[i][j] == objetos.parede) {
            matriz[i][j] = objetos.nada;
        }
        console.log(matriz);
    }
    if(ferramenta == ferramentas.robo) {
        if(matriz[i][j] == objetos.robo) {
            matriz[i][j] = objetos.nada;
        } else if(matriz[i][j] == objetos.nada) {
            removerObjetos(objetos.robo);
            matriz[i][j] = objetos.robo;
            robo = {
                x: j,
                y: i
            }
        }
    }
    if(ferramenta == ferramentas.alvo) {
        if(matriz[i][j] == objetos.alvo) {
            matriz[i][j] = objetos.nada;
        } else if(matriz[i][j] == objetos.nada) {
            removerObjetos(objetos.alvo);
            matriz[i][j] = objetos.alvo;
        }
    }
    desenharTabuleiro();
}

/**
 * Remover objetos do tabuleiro
 * @param {*} objeto 
 */
function removerObjetos(objeto) {
    for(var i = 0; i < altura; i++) {
        for(var j = 0; j < largura; j++) {
            if(matriz[i][j] == objeto) {
                matriz[i][j] = objetos.nada;
            }
        }
    }
}

/**
 * Varificar se existe objeto
 * @param {*} objeto 
 */
function existeObjeto(objeto) {
    for(var i = 0; i < altura; i++) {
        for(var j = 0; j < largura; j++) {
            if(matriz[i][j] == objeto) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Obter objeto
 * @param {*} x 
 * @param {*} y 
 */
function getObjeto(x, y) {
    return matriz[y][x];
}

/**
 * Selecionar exemplo
 * @param {*} id 
 */
function selecionarExemplo(id) {
    if(!confirm("Deseja abrir este exemplo?")) {
        return;
    }
    if(id == 1) {
        matriz = [
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,1,0,0,0,1,0,0,0,1],
            [1,0,2,1,0,1,0,1,0,1,0,1],
            [1,0,1,1,0,1,0,0,0,0,0,1],
            [1,0,0,0,0,1,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,1,1,1,0,1],
            [1,0,1,3,1,0,0,0,0,0,0,1],
            [1,0,1,0,0,0,0,1,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1],
        ];
        altura = matriz.length;
        largura = matriz[0].length;
        robo = {
            x: 2,
            y: 2
        }
        desenharTabuleiro();
        selecionarFerramenta(ferramentas.ponteiro);
    }
    if(id == 2) {
        matriz = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,2,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];
        altura = matriz.length;
        largura = matriz[0].length;
        robo = {
            x: 8,
            y: 7
        }
        desenharTabuleiro();
        selecionarFerramenta(ferramentas.ponteiro);
    }
    if(id == 3) {
        matriz = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,0,1,1,1,0,1,0,1,0,1,3,1],
            [1,0,1,0,1,1,1,0,1,0,1,0,1,1],
            [1,1,0,1,0,1,1,1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1,1,1,0,1,0,1,1],
            [1,1,0,1,1,1,0,1,0,1,0,1,0,1],
            [1,0,1,0,1,1,1,0,1,1,1,0,1,1],
            [1,1,0,1,0,1,1,1,0,1,1,1,0,1],
            [1,0,1,0,1,0,1,1,1,0,1,1,1,1],
            [1,1,0,1,0,1,0,1,1,1,0,1,1,1],
            [1,0,1,0,1,0,1,0,1,1,1,0,1,1],
            [1,1,0,1,0,1,0,1,0,1,0,1,0,1],
            [1,2,1,0,1,0,1,0,1,0,1,0,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        ];
        altura = matriz.length;
        largura = matriz[0].length;
        robo = {
            x: 1,
            y: 12
        }
        desenharTabuleiro();
        selecionarFerramenta(ferramentas.ponteiro);
    }
}

/**
 * Permite diagonal
 */
function permiteDiagonal() {
    diagonal = !diagonal;
    $("#botao-diagonal").removeClass("botao-on");
    $("#botao-diagonal").removeClass("botao-off");
    if(diagonal) {
        $("#botao-diagonal").addClass("botao-on");
        $("#botao-diagonal").html("Diagonal (ON)");
    } else {
        $("#botao-diagonal").addClass("botao-off");
        $("#botao-diagonal").html("Diagonal (OFF)");
    }
}

function zoomin() {
    zoom += 5;
    if(zoom > 30) {
        zoom = 30;
    }
    desenharTabuleiro();
}

function zoomout() {
    zoom -= 5;
    if(zoom < 5) {
        zoom = 5;
    }
    desenharTabuleiro();
}