import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LivroItem from "../components/LivroItem";

const CHAVE_STORAGE = "@to-be-read:livros";

export default function ListaLivrosScreen() {
  const [livros, setLivros] = useState([]);
  const [tituloInput, setTituloInput] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [editarLivro, setEditarLivro] = useState(null);

  // Função auxiliar para aplicar máscara DD/MM/AAAA e barrar caracteres inválidos
  function aplicarMascaraData(texto) {
    const apenasNumeros = texto.replace(/\D/g, "").slice(0, 8);
    if (apenasNumeros.length <= 2) return apenasNumeros;
    if (apenasNumeros.length <= 4)
      return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
  }

  // Carregar do AsyncStorage ao iniciar
  useEffect(() => {
    async function carregarLivros() {
      try {
        const livrosSalvos = await AsyncStorage.getItem(CHAVE_STORAGE);
        if (livrosSalvos !== null) {
          setLivros(JSON.parse(livrosSalvos));
        }
      } catch (erro) {
        console.error("Erro ao carregar livros:", erro);
      } finally {
        setCarregando(false);
      }
    }
    carregarLivros();
  }, []);

  // Salvar no AsyncStorage quando a lista de livros for alterada
  useEffect(() => {
    if (carregando) return;
    AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(livros)).catch(
      (erro) => console.error("Erro ao salvar livros:", erro)
    );
  }, [livros, carregando]);

  function adicionarLivro() {
    const titulo = tituloInput.trim();
    if (titulo === "") return;

    const novoLivro = {
      id: Date.now().toString(),
      titulo,
      lido: false,
      avaliacao: "",
      dataInicio: "",
      dataFim: "",
    };

    setLivros((livrosAtuais) => [...livrosAtuais, novoLivro]);
    setTituloInput("");
  }

  function alternarLido(id) {
    setLivros((livrosAtuais) =>
      livrosAtuais.map((livro) =>
        livro.id === id ? { ...livro, lido: !livro.lido } : livro
      )
    );
  }

  function excluirLivro(id) {
    setLivros((livrosAtuais) =>
      livrosAtuais.filter((livro) => livro.id !== id)
    );
  }

  function limparLivros() {
    setLivros([]);
  }

  function salvarEdicao() {
    if (!editarLivro || editarLivro.titulo.trim() === "") return;

    setLivros((livrosAtuais) =>
      livrosAtuais.map((item) =>
        item.id === editarLivro.id
          ? {
              ...item,
              titulo: editarLivro.titulo.trim(),
              avaliacao: editarLivro.avaliacao,
              dataInicio: editarLivro.dataInicio,
              dataFim: editarLivro.dataFim,
            }
          : item
      )
    );

    setEditarLivro(null);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.titulo}>Virando a página 📖</Text>

      {/* Formulário de Adição */}
      <View style={styles.formulario}>
      <TextInput
        style={styles.input}
        placeholder="Qual sua próxima leitura?"
        value={tituloInput}
        onChangeText={setTituloInput}
        autoCorrect={false}
        onSubmitEditing={adicionarLivro}
        returnKeyType="done"
      />        
      <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={adicionarLivro}
        >
          <Text style={styles.textoBotaoAdicionar}>Adicionar 🌟</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoLimpar} onPress={limparLivros}>
        <Text style={styles.textoBotaoLimpar}>Limpar estante</Text>
      </TouchableOpacity>

      {/* Lista de Livros */}
      <FlatList
        data={livros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LivroItem
            livro={item}
            aoAlternarConcluida={alternarLido}
            aoExcluir={excluirLivro}
            aoEditar={() => setEditarLivro(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>
            Nenhum livro na sua estante ainda. Adicione o primeiro!
          </Text>
        }
        contentContainerStyle={styles.listaConteudo}
      />

      {/* Modal de Edição */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!editarLivro}
        onRequestClose={() => setEditarLivro(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Detalhes do Livro</Text>

            <Text style={styles.labelInput}>Título do Livro:</Text>
            <TextInput
              style={styles.inputModal}
              value={editarLivro?.titulo || ""}
              onChangeText={(texto) =>
                setEditarLivro((atual) => ({ ...atual, titulo: texto }))
              }
            />

            {/* Seleção por Estrelas (1 a 5) */}
            <Text style={styles.labelInput}>Avaliação (Clique para selecionar):</Text>
            <View style={styles.containerEstrelas}>
              {[1, 2, 3, 4, 5].map((estrela) => (
                <TouchableOpacity
                  key={estrela}
                  onPress={() =>
                    setEditarLivro((atual) => ({
                      ...atual,
                      avaliacao: atual?.avaliacao == String(estrela) ? "" : String(estrela),
                    }))
                  }
                >
                  <Text style={styles.iconeEstrela}>
                    {estrela <= Number(editarLivro?.avaliacao || 0) ? "⭐" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs de Data com Máscara e Teclado Numérico */}
            <View style={styles.rowInputs}>
              <View style={styles.colunaData}>
                <Text style={styles.labelInput}>Início:</Text>
                <TextInput
                  style={styles.inputModal}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  maxLength={10}
                  value={editarLivro?.dataInicio || ""}
                  onChangeText={(texto) =>
                    setEditarLivro((atual) => ({
                      ...atual,
                      dataInicio: aplicarMascaraData(texto),
                    }))
                  }
                />
              </View>

              <View style={styles.colunaDataDireita}>
                <Text style={styles.labelInput}>Término:</Text>
                <TextInput
                  style={styles.inputModal}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
                  maxLength={10}
                  value={editarLivro?.dataFim || ""}
                  onChangeText={(texto) =>
                    setEditarLivro((atual) => ({
                      ...atual,
                      dataFim: aplicarMascaraData(texto),
                    }))
                  }
                />
              </View>
            </View>

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelar]}
                onPress={() => setEditarLivro(null)}
              >
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvar]}
                onPress={salvarEdicao}
              >
                <Text style={styles.textoBotaoModal}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#370040",
  },
  formulario: {
    flexDirection: "row",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#370040",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  botaoAdicionar: {
    backgroundColor: "#6b009c",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotaoAdicionar: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoLimpar: {
    backgroundColor: "#de2e2e",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
    marginBottom: 16,
  },
  textoBotaoLimpar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  listaConteudo: {
    paddingBottom: 20,
  },
  listaVazia: {
    textAlign: "center",
    color: "#888",
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  labelInput: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
  },
  containerEstrelas: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    marginTop: 4,
  },
  iconeEstrela: {
    fontSize: 28,
  },
  inputModal: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  colunaData: {
    flex: 1,
    marginRight: 6,
  },
  colunaDataDireita: {
    flex: 1,
    marginLeft: 6,
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  botaoModal: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  botaoCancelar: {
    backgroundColor: "#888",
  },
  botaoSalvar: {
    backgroundColor: "#2e86de",
  },
  textoBotaoModal: {
    color: "#fff",
    fontWeight: "bold",
  },
});