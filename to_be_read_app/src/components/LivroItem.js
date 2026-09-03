import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LivroItem({
  livro,
  aoAlternarConcluida,
  aoExcluir,
  aoEditar,

}) {
  // Converte o valor numérico da nota em estrelas visuais
  const renderizarEstrelas = (nota) => {
    const qtd = Number(nota) || 0;
    return "⭐".repeat(qtd);
  };

  return (
    <View style={styles.item}>
      {/* Ao tocar na área do texto, alterna o status de lido/pendente */}
      <TouchableOpacity
        style={styles.textoContainer}
        onPress={() => aoAlternarConcluida(livro.id)}
      >
        <Text style={[styles.titulo, livro.lido && styles.textoConcluido]}>
          {livro.lido ? "✅ " : "📖 "}
          {livro.titulo}
        </Text>

        {/* Exibe estrelas em vez do número bruto */}
        {livro.avaliacao ? (
          <Text style={styles.detalhes}>
            Nota: {renderizarEstrelas(livro.avaliacao)}
          </Text>
        ) : null}

        {livro.dataInicio || livro.dataFim ? (
          <Text style={styles.detalhes}>
            📅 {livro.dataInicio || "..."} até {livro.dataFim || "..."}
          </Text>
        ) : null}
      </TouchableOpacity>

      {/* Botões de Ação */}
      <View style={styles.botoesContainer}>
        <TouchableOpacity style={styles.botaoEditar} onPress={aoEditar}>
          <Text style={styles.textoBotaoEditar}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={() => aoExcluir(livro.id)}
        >
          <Text style={styles.textoBotaoExcluir}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 4,
    borderLeftColor: "#2e86de",
    elevation: 2, // Sombra suave no Android
    shadowColor: "#000", // Sombra no iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoContainer: {
    flex: 1,
    marginRight: 8,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  textoConcluido: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  detalhes: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  botoesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  botaoEditar: {
    backgroundColor: "#e1b12c",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  textoBotaoEditar: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  botaoExcluir: {
    backgroundColor: "#e84118",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  textoBotaoExcluir: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});