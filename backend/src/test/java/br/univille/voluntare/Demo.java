package br.univille.voluntare;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Ids fixos da massa de demonstração (V8, D-21). O 1º dígito diz a tabela e o último bloco, o número:
 * a vaga 1 é 40000000-0000-0000-0000-000000000001. Assim os testes continuam falando em "vaga 1".
 */
public final class Demo {

    public static final String SENHA = "Voluntare@2026";

    private static final Pattern MARCADOR =
            Pattern.compile(":(organizacao|usuario|habilidade|vaga|candidatura|participacao)(\\d+)");

    private Demo() {
    }

    public static String organizacao(int n) {
        return id(1, n);
    }

    public static String usuario(int n) {
        return id(2, n);
    }

    public static String habilidade(int n) {
        return id(3, n);
    }

    public static String vaga(int n) {
        return id(4, n);
    }

    public static String candidatura(int n) {
        return id(5, n);
    }

    public static String participacao(int n) {
        return id(6, n);
    }

    public static UUID uuid(String id) {
        return UUID.fromString(id);
    }

    /** Troca marcadores como :vaga1 ou :usuario4 pelo UUID entre aspas, para escrever SQL legível nos testes. */
    public static String sql(String texto) {
        Matcher m = MARCADOR.matcher(texto);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            int tabela = switch (m.group(1)) {
                case "organizacao" -> 1;
                case "usuario" -> 2;
                case "habilidade" -> 3;
                case "vaga" -> 4;
                case "candidatura" -> 5;
                default -> 6;
            };
            m.appendReplacement(sb, "'" + id(tabela, Integer.parseInt(m.group(2))) + "'");
        }
        m.appendTail(sb);
        return sb.toString();
    }

    private static String id(int tabela, int n) {
        return "%d0000000-0000-0000-0000-%012d".formatted(tabela, n);
    }
}
