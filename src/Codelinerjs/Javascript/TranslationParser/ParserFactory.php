<?php
namespace Codelinerjs\Javascript\TranslationParser;

use Zend\ServiceManager\FactoryInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
/**
 * Description of ParserFactory
 *
 * @author Alexander Miertsch <kontakt@codeliner.ws>
 * @copyright (c) 2013, Alexander Miertsch
 */
class ParserFactory implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $serviceLocator)
    {
        $translationParser = new TranslationParser();

        $phpRenderer = $serviceLocator->get('ViewRenderer');

        $translationParser->setView($phpRenderer);

        return $translationParser;
    }
}
