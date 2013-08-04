<?php
namespace Codelinerjs\Javascript;

use Zend\ServiceManager\FactoryInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
/**
 * Description of AbstractLoaderServiceFactory
 *
 * @author Alexander Miertsch <kontakt@codeliner.ws>
 * @copyright (c) 2013, Alexander Miertsch
 */
abstract class AbstractLoaderServiceFactory  implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $serviceLocator)
    {
        // Configure the JsLoader
        $config = $serviceLocator->get('Configuration');
        if (!isset($config['codelinerjs.js_loader'])) {
            throw new Exception('no config for js_loader found');
        }

        $jlConfig = $config['codelinerjs.js_loader'];

        if (!isset($jlConfig[$this->getName()])) {
            throw new Exception('Can not find config for js_loader instance: ' . $this->getName());
        }

        $jlConfig = $jlConfig[$this->getName()];

        $staging = "production";

        if (isset($jlConfig['staging'])) {
            $staging = $jlConfig['staging'];
        }

        $jsLoader = new Loader($staging);
        $jsLoader->setServiceLocator($serviceLocator);

        if ($serviceLocator->has('translator'))
            $jsLoader->setTranslator($serviceLocator->get('translator'));

        if (isset($jlConfig['use_client_translation'])) {
            $jsLoader->setUseClientTranslation($jlConfig['use_client_translation']);
        }

        $jsLoader->setIncludePaths($jlConfig['includePaths']);

        $jsLoader->setViewResolver($serviceLocator->get('ViewResolver'));

        if (isset($jlConfig['public_path']))
            $jsLoader->setCoreTmpPath($jlConfig['public_path']);
        if (isset($jlConfig['public_link']))
            $jsLoader->setPublicLink($jlConfig['public_link']);
        if (isset($jlConfig['preInitLoadStack']))
            $jsLoader->setPreInitLoadStack($jlConfig['preInitLoadStack']);
        if (isset($jlConfig['postInitLoadStack']))
            $jsLoader->setPostInitLoadStack($jlConfig['postInitLoadStack']);
        if (isset($jlConfig['appVars']))
            $jsLoader->addAppVars($jlConfig['appVars']);
        if (isset($jlConfig['template_parsers']))
            $jsLoader->setTemplateParsers($jlConfig['template_parsers']);
        if (isset($jlConfig['templates']))
            $jsLoader->setTemplates($jlConfig['templates']);
        if (isset($jlConfig['core_script_name']))
            $jsLoader->setCoreScriptName($jlConfig['core_script_name']);
        if (isset($jlConfig['cache_loaded_classes']))
            $jsLoader->setCacheLoadedClasses($jlConfig['cache_loaded_classes']);
        if (isset($jlConfig['cache_path']))
            $jsLoader->setCachePath($jlConfig['cache_path']);
        if (isset($jlConfig['cache_filename']))
            $jsLoader->setCacheFilename($jlConfig['cache_filename']);

        return $jsLoader;
    }

    abstract protected function getName();
}