<?php
namespace Codelinerjs\Javascript\TranslationParser;

/**
 * Description of TranslationParser
 *
 * @author Alexander Miertsch <kontakt@codeliner.ws>
 * @copyright (c) 2013, Alexander Miertsch
 */
class TranslationParser
{
    protected $view;

    public function setView($view)
    {
        $this->view = $view;
    }

    public function parse($tpl) {
        $tpl = $this->_parseTranslations($tpl);
        return $tpl;
    }

    protected function _parseTranslations($tpl) {
        $matches = array();
        preg_match_all('/\$CL\.translate\(["\'](?P<translation_keys>[^"\']+)["\']\)/', $tpl, $matches);

        if (isset($matches['translation_keys']) && count($matches['translation_keys'])) {
            foreach ($matches['translation_keys'] as $translationKey) {
                $translatedKey = $this->view->translate($translationKey);

                $tpl = preg_replace('/\$CL\.translate(\(["\'])' . preg_quote($translationKey) . '(["\']\))/', '$CL.translate$1' . $translatedKey . '$2', $tpl);
            }
        }

        return $tpl;
    }
}
