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
  const [buscaInput, setBuscaInput] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Controle de Modais e Estados de Formulário
  const [modalAddVisivel, setModalAddVisivel] = useState(false);
  const [novoLivro, setNovoLivro] = useState({
    titulo: "",
    autor: "",
    dataInicio: "",
  });
  const [editarLivro, setEditarLivro] = useState(null);
  const [avaliarLivro, setAvaliarLivro] = useState(null);

  // Estado para controlar a confirmação de exclusão (1 livro ou todos)
  // Formato: null | { tipo: 'unico', id: string, titulo: string } | { tipo: 'todos' }
  const [modalExcluir, setModalExcluir] = useState(null);

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
    AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(livros)).catch((erro) =>
      console.error("Erro ao salvar livros:", erro),
    );
  }, [livros, carregando]);

  // Adicionar novo livro via Modal
  function adicionarLivro() {
    const titulo = novoLivro.titulo.trim();
    if (titulo === "") return;

    const item = {
      id: Date.now().toString(),
      titulo,
      autor: novoLivro.autor.trim(),
      lido: false,
      avaliacao: "",
      dataInicio: novoLivro.dataInicio,
      dataFim: "",
    };

    setLivros((livrosAtuais) => [item, ...livrosAtuais]);
    setNovoLivro({ titulo: "", autor: "", dataInicio: "" });
    setModalAddVisivel(false);
  }

  // Clique no livro: se não lido, abre o modal de avaliação. Se já lido, desmarca.
  function tratarCliqueConcluir(livro) {
    if (!livro.lido) {
      setAvaliarLivro({
        ...livro,
        avaliacao: livro.avaliacao || "",
      });
    } else {
      setLivros((livrosAtuais) =>
        livrosAtuais.map((item) =>
          item.id === livro.id ? { ...item, lido: false } : item
        )
      );
    }
  }

  // Confirmar avaliação e marcar como concluído
  function salvarAvaliacao() {
    if (!avaliarLivro) return;

    setLivros((livrosAtuais) =>
      livrosAtuais.map((item) =>
        item.id === avaliarLivro.id
          ? {
              ...item,
              lido: true,
              avaliacao: avaliarLivro.avaliacao,
            }
          : item
      )
    );
    setAvaliarLivro(null);
  }

  // Editar Título, Autor e Datas (sem mexer na avaliação)
  function salvarEdicao() {
    if (!editarLivro || editarLivro.titulo.trim() === "") return;

    setLivros((livrosAtuais) =>
      livrosAtuais.map((item) =>
        item.id === editarLivro.id
          ? {
              ...item,
              titulo: editarLivro.titulo.trim(),
              autor: editarLivro.autor ? editarLivro.autor.trim() : "",
              dataInicio: editarLivro.dataInicio,
              dataFim: editarLivro.dataFim,
            }
          : item,
      ),
    );

    setEditarLivro(null);
  }

  // Funções de solicitação e confirmação de exclusão
  function solicitarExclusaoLivro(livro) {
    setModalExcluir({ tipo: "unico", id: livro.id, titulo: livro.titulo });
  }

  function solicitarExclusaoTodos() {
    if (livros.length === 0) return;
    setModalExcluir({ tipo: "todos" });
  }

  function confirmarExclusao() {
    if (!modalExcluir) return;

    if (modalExcluir.tipo === "unico") {
      setLivros((livrosAtuais) =>
        livrosAtuais.filter((livro) => livro.id !== modalExcluir.id)
      );
    } else if (modalExcluir.tipo === "todos") {
      setLivros([]);
    }

    setModalExcluir(null);
  }

  // Filtro de busca em tempo real pelo título ou autor
  const livrosFiltrados = livros.filter(
    (l) =>
      l.titulo.toLowerCase().includes(buscaInput.toLowerCase()) ||
      (l.autor && l.autor.toLowerCase().includes(buscaInput.toLowerCase()))
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.titulo}>Virando a página 📖</Text>

      {/* 1. BARRA DE PESQUISA */}
      <TextInput
        style={styles.input}
        placeholder="🔎︎ Buscar por título ou autor..."
        value={buscaInput}
        onChangeText={setBuscaInput}
        autoCorrect={false}
      />

      {/* 2. BOTÃO ADICIONAR NOVA LEITURA */}
      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={() => setModalAddVisivel(true)}
      >
        <Text style={styles.textoBotaoAdicionar}>Adicionar nova leitura 🌟</Text>
      </TouchableOpacity>

      {/* 3. EXCLUIR LISTA DE LIVROS */}
      <TouchableOpacity
        style={styles.botaoLimpar}
        onPress={solicitarExclusaoTodos}
      >
        <Text style={styles.textoBotaoLimpar}>Excluir lista de livros</Text>
      </TouchableOpacity>

      {/* Lista de Livros Filtrados */}
      <FlatList
        data={livrosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LivroItem
            livro={item}
            aoAlternarConcluida={() => tratarCliqueConcluir(item)}
            aoExcluir={() => solicitarExclusaoLivro(item)}
            aoEditar={() => setEditarLivro(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>
            {buscaInput
              ? "Nenhum livro encontrado."
              : "Nenhum livro na sua estante ainda. Adicione o primeiro!"}
          </Text>
        }
        contentContainerStyle={styles.listaConteudo}
      />

      {/* MODAL 1: Adicionar Novo Livro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalAddVisivel}
        onRequestClose={() => setModalAddVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Novo Livro</Text>

            <Text style={styles.labelInput}>Título do Livro:</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ex: O Hobbit"
              value={novoLivro.titulo}
              onChangeText={(texto) =>
                setNovoLivro((atual) => ({ ...atual, titulo: texto }))
              }
            />

            <Text style={styles.labelInput}>Nome do Autor:</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ex: J.R.R. Tolkien"
              value={novoLivro.autor}
              onChangeText={(texto) =>
                setNovoLivro((atual) => ({ ...atual, autor: texto }))
              }
            />

            <Text style={styles.labelInput}>Data de Início:</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
              value={novoLivro.dataInicio}
              onChangeText={(texto) =>
                setNovoLivro((atual) => ({
                  ...atual,
                  dataInicio: aplicarMascaraData(texto),
                }))
              }
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelar]}
                onPress={() => setModalAddVisivel(false)}
              >
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvar]}
                onPress={adicionarLivro}
              >
                <Text style={styles.textoBotaoModal}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Editar Livro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!editarLivro}
        onRequestClose={() => setEditarLivro(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Editar Livro</Text>

            <Text style={styles.labelInput}>Título do Livro:</Text>
            <TextInput
              style={styles.inputModal}
              value={editarLivro?.titulo || ""}
              onChangeText={(texto) =>
                setEditarLivro((atual) => ({ ...atual, titulo: texto }))
              }
            />

            <Text style={styles.labelInput}>Nome do Autor:</Text>
            <TextInput
              style={styles.inputModal}
              value={editarLivro?.autor || ""}
              onChangeText={(texto) =>
                setEditarLivro((atual) => ({ ...atual, autor: texto }))
              }
            />

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

      {/* MODAL 3: Avaliação de Leitura Concluída */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!avaliarLivro}
        onRequestClose={() => setAvaliarLivro(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Leitura Concluída! 🎉</Text>
            <Text style={styles.labelInput}>Como você avalia este livro?</Text>

            <View style={styles.containerEstrelas}>
              {[1, 2, 3, 4, 5].map((estrela) => (
                <TouchableOpacity
                  key={estrela}
                  onPress={() =>
                    setAvaliarLivro((atual) => ({
                      ...atual,
                      avaliacao: String(estrela),
                    }))
                  }
                >
                  <Text style={styles.iconeEstrela}>
                    {estrela <= Number(avaliarLivro?.avaliacao || 0)
                      ? "⭐"
                      : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelar]}
                onPress={() => setAvaliarLivro(null)}
              >
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvar]}
                onPress={salvarAvaliacao}
              >
                <Text style={styles.textoBotaoModal}>Concluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: Confirmação de Exclusão (Livro único ou Todos) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!modalExcluir}
        onRequestClose={() => setModalExcluir(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Confirmar Exclusão ⚠️</Text>

            <Text style={styles.textoConfirmacao}>
              {modalExcluir?.tipo === "todos"
                ? "Tem certeza de que deseja excluir TODOS os livros da sua lista? Esta ação não pode ser desfeita."
                : `Tem certeza de que deseja excluir o livro "${modalExcluir?.titulo}"?`}
            </Text>

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelar]}
                onPress={() => setModalExcluir(null)}
              >
                <Text style={styles.textoBotaoModal}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoExcluirModal]}
                onPress={confirmarExclusao}
              >
                <Text style={styles.textoBotaoModal}>Excluir</Text>
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
    backgroundColor: "#ffefde",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#450920",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#450920",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    width: "100%",
  },
  botaoAdicionar: {
    backgroundColor: "#450920",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    width: "100%",
  },
  textoBotaoAdicionar: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoLimpar: {
    backgroundColor: "#d40000",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  textoBotaoLimpar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  listaConteudo: {
    paddingBottom: 20,
  },
  listaVazia: {
    textAlign: "center",
    color: "#da627d",
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
    color: "#450920",
  },
  textoConfirmacao: {
    fontSize: 14,
    color: "#450920",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  labelInput: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#450920",
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
    borderColor: "#da627d",
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
    backgroundColor: "#450920",
  },
  botaoSalvar: {
    backgroundColor: "#da627d",
  },
  botaoExcluirModal: {
    backgroundColor: "#d40000",
  },
  textoBotaoModal: {
    color: "#fff",
    fontWeight: "bold",
  },
});
