import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LivroItem({livro, aoAlternarConcluida, aoExcluir, aoEditar}){
    return(

    <View style={styles.item}>
      {/* Ao tocar no texto, a tarefa alterna entre concluída/pendente */}
      <TouchableOpacity
        style={styles.textoContainer}
        onPress={() => aoAlternarConcluida(livro.id)}
      >
        <Text style={[styles.texto, livro.concluida && styles.textoConcluido]}>
          {livro.texto}
        </Text>
      </TouchableOpacity>

      {/* Botão de Editar */}
      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={aoEditar}
      >
        <Text style={styles.textoBotaoEditar}>Editar</Text>
      </TouchableOpacity>

      {/* Botão de Excluir */}
      <TouchableOpacity
        style={styles.botaoExcluir}
        onPress={() => aoExcluir(tarefa.id)}
      >
        <Text style={styles.textoBotaoExcluir}>Excluir</Text>
      </TouchableOpacity>
    </View>

    )
}

const styles = StyleSheet.create({

})