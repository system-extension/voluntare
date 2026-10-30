package br.univille.voluntare.parametro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.univille.voluntare.parametro.entity.Parametro;

public interface ParametroRepository extends JpaRepository<Parametro, String> {
}
