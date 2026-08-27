import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import LivroItem from "../components/LivroItem"


export default function ListaLivrosScreen (
){

  const [tarefas, setTarefas] = useState([]);
  const [textoInput, setTextoInput] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [editarTarefa, setEditarTarefa] = useState(null);


  function adicionarLeitura(){
    const texto = textoInput.trim();
     if (texto === "") return;

    const novaTarefa = {
      id: Date.now().toString(),
      texto,
      concluida: false,
    };

    setTarefas((tarefasAtuais) => [...tarefasAtuais, novaTarefa]);
    setTextoInput("")

  }
  return(
<View>
    <Text style={styles.titulo}> Virando a página</Text>
    <View>

      <TextInput style={styles.input} placeholder="Qual sua próxima leitura?"/>
      <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={adicionarLeitura}>
        <Text style={styles.textoBotaoAdicionar}>Adicionar leitura 🌟</Text>
      </TouchableOpacity>
    </View>
  </View>
  )
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
  },
  formulario: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  botaoExcluir: {
    backgroundColor: "#de2e2e",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    marginLeft: 6,
  },
  textoBotaoExcluir: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoAdicionar: {
    backgroundColor: "#2e86de",
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  textoBotaoAdicionar: {
    color: "#fff",
    fontWeight: "bold",
  },
  listaConteudo: {
    paddingBottom: 20,
  },
  listaVazia: {
    textAlign: "center",
    color: "#888",
    marginTop: 24,
  },
  /* ESTILOS DO MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  },
  inputModal: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
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