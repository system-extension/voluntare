package br.univille.voluntare.usuario.entity;

/** CHECK ck_usuario_papel. Gestor e coordenador pertencem a uma organização; voluntário não. */
public enum Papel {
    VOLUNTARIO,
    COORDENADOR,
    GESTOR
}
