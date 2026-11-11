#include <stdio.h>

void trocar(int *a, int *b){
    int temp = *a;
    *a = *b;
    *b = temp;
}

void max_heapify(int vetor [], int tamanho, int pai){
    int maior = pai;

    int filhoEsquerdo = 2 * pai + 1;
    int filhoDireito = 2 * pai + 2;

    if(filhoEsquerdo < tamanho && 
        vetor[filhoEsquerdo] > vetor[maior]){
        maior = filhoEsquerdo;
    }

    if(filhoDireito < tamanho && 
        vetor[filhoDireito] > vetor[maior]){
        maior = filhoDireito;
    }

    if(maior != pai){
        trocar(&vetor[pai], &vetor[maior]);

        max_heapify(vetor, tamanho, maior);
    }
}

void build_heap(int vetor [], int tamanho){
    for(int i = tamanho/ 2 -1; i >= 0; i--){
        max_heapify(vetor,tamanho, i);
    }
}

void heapSort(int vetor[], int tamanho){
    build_heap(vetor, tamanho);

    for(int i = tamanho - 1; i > 0; i--){
        trocar(&vetor[0], &vetor[i]);

        max_heapify(vetor, i, 0);
    }

}


int main(){


    int numeros [] = {4, 8, 3, 9};
    int tamanho= sizeof(numeros)/sizeof(numeros[0]);

    printf("LISTA DESORDENADA: \n");

    for(int i = 0; i <= tamanho -1; i++){
        printf("%d\n", numeros[i]);
    }

    heapSort(numeros, tamanho);

    printf("LISTA ORDENADA: \n");


    for(int i = 0; i <= tamanho -1; i++){
        printf("%d\n", numeros[i]);
    }

    
}

